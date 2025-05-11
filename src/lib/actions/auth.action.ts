"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  signInFormInferSchema,
  signInFormSchema,
} from "../validators/authSchema";
import {
  comparePasswords
} from "../auth/passwordHasher";
import { createUserSession, removeUserFromSession } from "../auth/session";
import prisma from "../prisma";
import { users_status } from "@/generated/prisma";

export async function signIn(values: signInFormInferSchema) {

  const validationResult = signInFormSchema.safeParse(values);

  if (!validationResult.success) {
    throw new Error("Input validation failed");
  }

  const { email, password } = validationResult.data;

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        password: true,
        password_expiry: true,
        salt: true,
        id: true,
        email: true,
        role: true,
        status: true
      },
    });

    if (!user?.password || !user?.salt) {
      throw new Error("Invalid email or password!");
    }

    const isCorrectPassword = await comparePasswords({
      hashedPassword: user.password,
      password,
      salt: user.salt,
    });

    if (!isCorrectPassword) {
      throw new Error("Invalid email or password!");
    }

    if (user.status !== users_status.ACTIVE) {
      throw new Error("Your account is not active. Please contact us!");
    }

    await createUserSession(user, await cookies());

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}


export async function logOut() {
  await removeUserFromSession(await cookies());
  redirect("/signin");
}
