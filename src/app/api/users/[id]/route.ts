import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { capitalizeString, makePhoneValid, storeChangeLog } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/currentUser";
import { users_role, users_status } from "@/generated/prisma";
import { getBranchesByUids, handleCrudError } from "@/lib/actions/util.action";
import { editUserSchema } from "@/lib/validators/authSchema";
import hasPermission from "@/lib/auth/permission";
import { SafeUser } from "@/lib/types";
import { hashPassword } from "@/lib/auth/password";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;

  const user = await prisma.users.findUnique({
    where: { public_id: userId, status: { not: users_status.DELETED } },
    select: {
      id: true,
      public_id: true,
      name: true,
      phone: true,
      national_id: true,
      branch: {
        select: {
          id: true,
          name: true
        }
      },
      email: true,
      image: true,
      role: true,
      status: true,
      created_at: true
    }
  });

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user })

}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: public_id } = await params;
    const body = await req.json();
    const { ...userData } = body;

    const loggedInUser = await getCurrentUser({ withFullUser: true }) as SafeUser;

    if (!loggedInUser) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const isPermitted = await hasPermission(loggedInUser, "users", "update");
    if (!isPermitted) {
      return NextResponse.json({ message: "You don't have permission to update user!" }, { status: 403 });
    }

    const schema = editUserSchema.partial({ password: true });
    const { success, data } = schema.safeParse(userData);
    if (!success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { public_id: public_id, status: { not: users_status.DELETED } },
      select: {
        id: true, name: true, email: true, password: true,
        role: true, status: true, national_id: true, phone: true,
        branch_id: true, updated_at: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updateData: Partial<{
      name: string;
      email: string;
      role: users_role;
      status: users_status;
      password: string;
      national_id: string;
      phone: string;
      branch_id: number;
    }> = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      national_id: data.national_id,
      phone: makePhoneValid(data.phone),
      branch_id: data.branch_id,
    };

    let otherDetails = "";
    if (data.password) {
      const hashedPassword = await hashPassword(data.password);
      updateData.password = hashedPassword;
      otherDetails = "Password updated.";
    }

    const updatedUser = await prisma.users.update({
      where: { id: existingUser.id },
      data: updateData,
      select: { id: true, role: true },
    });

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    let prevBranchName = "", newBranchName = "";
    if (existingUser.branch_id !== data.branch_id) {
      const branchIds = [existingUser.branch_id, data.branch_id].filter((id): id is number => id !== null && id !== undefined);
      const branches = await getBranchesByUids(branchIds);
      prevBranchName = branches.find(b => b.id === existingUser.branch_id)?.name || "";
      newBranchName = branches.find(b => b.id === data.branch_id)?.name || "";
    }

    const originalData = {
      name: existingUser.name,
      email: existingUser.email,
      branch: prevBranchName,
      status: capitalizeString(existingUser.status.toString()),
      phone: existingUser.phone,
      national_id: existingUser.national_id,
      role: capitalizeString(existingUser.role),
    };

    const newData = {
      name: data.name,
      email: data.email,
      branch: newBranchName,
      status: capitalizeString(data.status.toString()),
      phone: data.phone,
      national_id: data.national_id,
      role: capitalizeString(data.role.toString()),
    };

    await storeChangeLog({
      action: "update",
      primaryAffectedEntity: `user[${existingUser.name}(${existingUser.email})]`,
      primaryAffectedEntityID: existingUser.id,
      primaryOrSecAffectedTable: "users",
      primaryOrSecAffectedEntityID: existingUser.id,
      originalData,
      newData,
      skipFields: [],
      loggedInUser,
      otherDetails,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleCrudError(error);
  }
}
