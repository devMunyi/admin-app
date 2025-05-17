// src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/actions/currentUser";
import hasPermission from "@/lib/auth/permission";
import { createUserSchema } from "@/lib/validators/authSchema";
import prisma from "@/lib/prisma";
import { makePhoneValid } from "@/lib/utils";
import { nowDatetimeObject } from "@/lib/constants";
import { handleCrudError } from "@/lib/actions/util.action";
import { SafeUser } from "@/lib/types";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const user = await getCurrentUser() as SafeUser;

        if (!user) {
            return NextResponse.json({ error: "Session expired!" }, { status: 401 });
        }


        const isPermitted = await hasPermission(user, "users", "update");
        if (!isPermitted) {
            return NextResponse.json({ error: "You don't have permission to create user!" }, { status: 403 });
        }

        const { success, data } = createUserSchema.safeParse(body);
        if (!success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(data.password);
        const createdUser = await prisma.users.create({
            data: {
                name: data.name,
                email: data.email,
                phone: makePhoneValid(data.phone),
                national_id: data.national_id,
                branch_id: data.branch_id,
                password: hashedPassword,
                role: data.role,
                public_id: nanoid(),
                created_at: nowDatetimeObject(),
            },
            select: { id: true, role: true },
        });

        if (!createdUser) {
            throw new Error("Failed to create user");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleCrudError(error);
    }
}
