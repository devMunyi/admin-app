import { cache } from "react";
import prisma from "../prisma";

export async function isNationalIdTaken(national_id: string, excludingUserId?: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
        where: { national_id },
        select: { id: true, national_id: true },
    });

    if (!user) {
        return false;
    }

    if (excludingUserId !== undefined) {
        return user.id !== excludingUserId;
    }

    return true;
}

export async function isEmailTaken(email: string, excludingUserId?: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
        where: { email },
        select: { id: true, email: true },
    });

    if (!user) {
        return false;
    }

    if (excludingUserId !== undefined) {
        return user.id !== excludingUserId;
    }

    return true; // Email is taken
}

export async function isPhoneTaken(phone: string, excludingUserId?: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
        where: { phone },
        select: { id: true, phone: true },
    });

    if (!user) {
        return false;
    }

    if (excludingUserId !== undefined) {
        return user.id !== excludingUserId;
    }

    return true; // Phone is taken
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function handleCrudError(error: any): never {
    const code = error?.code || "unknown_error";

    if (code === "P2002") {
        const { target } = error.meta || {};

        const errorMap: Record<string, string> = {
            email: "Email already exists",
            phone: "Phone number already exists",
            national_id: "National ID already exists"
        };

        for (const [field, message] of Object.entries(errorMap)) {
            if (target?.includes(field)) {
                throw new Error(message);
            }
        }
    }

    // For other error codes or unknown errors
    throw new Error(error?.message || "Something went wrong!");
}


export const getBranches = cache(async () => {
    return await prisma.branches.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
});

export async function getBranchesByUids(branchUids: number[]) {
    return await prisma.branches.findMany({
        where: { id: { in: branchUids } },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
}