import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { omit } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/currentUser";
import { users_role, users_status } from "@/generated/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const currentUser = await getCurrentUser();

  // Check authentication
  if (!currentUser || !currentUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      branch:{
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
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ data: user })

}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();

  // Check authentication
  if (!currentUser || !currentUser.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, password, role, status } = body;
  const userId = params.id;

  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use by another account." },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      name?: string;
      password?: string;
      role?: users_role;
      status?: users_status;
    } = {
      ...(email && { email }),
      ...(name && { name }),
      ...(role && { role: role }), // Explicitly cast role to User_role
      ...(status && { status }),
    };

    // Only hash and update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: Number(userId) },
      data: updateData, // Ensure updateData matches the expected type
    });

    const saferUser = omit(updatedUser, ["password"]);
    return NextResponse.json(saferUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

