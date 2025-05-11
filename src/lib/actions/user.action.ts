"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { generateSalt, hashPassword } from "../auth/passwordHasher";
import { createUserSchema, CreateUserValues, editUserSchema, EditUserValues } from "../validators/authSchema";
import { getCurrentUser } from "./currentUser";
import hasPermission from "../auth/permission";
import { SafeUser } from "../types";
import { users_role, users_status } from "@/generated/prisma";
import { capitalizeString, makePhoneValid, storeChangeLog } from "../utils";
import { nanoid } from "nanoid";
import { nowDatetimeObject } from "../constants";
import { getBranchesByUids, handleCrudError } from "./util.action";


type FindAllUsersProps = {
  page: number;
  rpp: number;
  role: string;
  status: string;
  search: string
}

export async function createUser(userData: CreateUserValues) {

  // get current user
  const user = await getCurrentUser({ withFullUser: true }) as SafeUser;

  // if no user redirectt to signin page
  if (!user) {
    throw new Error("session expired");
  }

  // check permision
  const isPermitted = await hasPermission(user, 'users', 'update');
  if (!isPermitted) {
    throw new Error("You don't have permission to perform this action");
  }

  const { success, data, error } = createUserSchema.safeParse(userData);

  if (!success) {
    throw new Error("Input validation failed");
  }

  try {

    const salt = generateSalt();
    const hashedPassword = await hashPassword(data.password, salt);

    const user = await prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        phone: makePhoneValid(data.phone),
        national_id: data.national_id,
        branch_id: data.branch_id,
        password: hashedPassword,
        salt,
        role: data.role,
        public_id: nanoid(),
        created_at: nowDatetimeObject()
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (user == null) {
      throw new Error("Failed to create user");
    }

    revalidatePath("/users");

    return { success: true };
  } catch (error: unknown) {
    handleCrudError(error);
  }
}


export async function updateUser(userId: number, userData: Partial<EditUserValues>) {

  // get current user
  const loggedInUser = await getCurrentUser({ withFullUser: true }) as SafeUser;

  // if no user redirectt to signin page
  if (!loggedInUser) {
    throw new Error("session expired");
  }

  // check permision
  const isPermitted = await hasPermission(loggedInUser, 'users', 'update');
  if (!isPermitted) {
    throw new Error("You don't have permission to perform this action");
  }

  // Validate input data (make password optional for updates)
  const updateSchema = editUserSchema.partial({ password: true });
  const { success, data, error } = updateSchema.safeParse(userData);

  if (!success) {
    throw new Error("Input validation failed");
  }

  try {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        salt: true,
        role: true,
        status: true,
        national_id: true,
        phone: true,
        branch_id: true,
        updated_at: true
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      role?: users_role;
      status: users_status;
      password?: string;
      salt?: string;
      national_id?: string;
      phone?: string;
      branch_id?: number;
    } = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      national_id: data.national_id,
      phone: makePhoneValid(data.phone),
      branch_id: data.branch_id,
    };

    // Only update password if provided
    let otherDetails = "";
    if (data.password) {
      const salt = generateSalt();
      const hashedPassword = await hashPassword(data.password, salt);
      updateData.password = hashedPassword;
      updateData.salt = salt;

      otherDetails = "Password updated.";
    }

    // Perform the update
    const user = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("Failed to update user");
    }

    let prevBranchName = "";
    let newBranchName = "";
    if (existingUser.branch_id !== data.branch_id) {
      const branchIds = [existingUser.branch_id, data.branch_id].filter((id): id is number => id !== null && id !== undefined);
      const branchesByUids = await getBranchesByUids(branchIds);

      prevBranchName = branchesByUids.find((branch) => branch.id === existingUser.branch_id)?.name || "";
      newBranchName = branchesByUids.find((branch) => branch.id === data.branch_id)?.name || "";
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

    //  change log
    await storeChangeLog({
      action: "update",
      primaryAffectedEntity: `user[${existingUser.name}(${existingUser.email})]`,
      primaryAffectedEntityID: userId,
      primaryOrSecAffectedTable: "users",
      primaryOrSecAffectedEntityID: userId,
      originalData,
      newData,
      skipFields: [],
      loggedInUser,
      otherDetails,
    })

    return { success: true };
  } catch (error: unknown) {
    handleCrudError(error);
  }
}


export async function getAllUsers(
  { page, rpp, role, status, search }: FindAllUsersProps
) {

  console.log({ page, rpp, role, status, search });

  const where: any = {};

  if (role && role !== "all") {
    where.role = role;

  }
  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    console.log("searching for: ", search);
    where.OR = [
      {
        name: {
          contains: search,
          // mode: "insensitive", this is valid for postgresql
          // but not for mysql
        },
      },
      {
        email: {
          contains: search,
          // mode: "insensitive", // mode: "insensitive", this is valid for postgresql
          // but not for mysql
        },
      },
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      where,
      skip: (page - 1) * rpp,
      take: rpp,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.users.count({ where }),
  ]);

  console.log({ users, totalCount });

  return {
    data: users,
    pagination: {
      total: totalCount,
      page,
      limit: rpp,
      totalPages: Math.ceil(totalCount / rpp),
    },
  };
}



