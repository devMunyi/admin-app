// src/app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import { users_status } from '@/generated/prisma';
import { signInFormSchema } from '@/lib/validators/authSchema';
import prisma from '@/lib/prisma';
import { createUserSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { omit } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        const requestData = await request.json();
        const validationResult = signInFormSchema.safeParse(requestData);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Input validation failed" },
                { status: 400 }
            );
        }

        const { email, password } = validationResult.data;

        const user = await prisma.users.findUnique({
            where: { email },
            select: {
                password: true,
                password_expiry: true,
                public_id: true,
                email: true,
                role: true,
                status: true,
                id: true,
                name: true,
                branch: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                phone: true,
                national_id: true,
                image: true,
                created_at: true,
            },
        });

        if (!user?.password) {
            return NextResponse.json(
                { error: "Invalid email or password!" },
                { status: 401 }
            );
        }

        const isCorrectPassword = await verifyPassword(password, user.password);
        if (!isCorrectPassword) {
            return NextResponse.json(
                { error: "Invalid email or password!" },
                { status: 401 }
            );
        }

        if (user.status !== users_status.ACTIVE) {
            return NextResponse.json(
                { error: "Your account is not active. Please contact us!" },
                { status: 403 }
            );
        }

        // Create the response object FIRST
        const safeUser = omit(user, ['password', 'password_expiry', "id"]);
        const response = NextResponse.json(
            { success: true, user: safeUser },
            { status: 200 }
        );

        // Create session and set cookie
        await createUserSession(
            {
                id: user.id,
                role: user.role,
                password_expiry: user.password_expiry
            },
            {
                set: (key, value, options) => {
                    // This is the crucial part - setting cookie on the response
                    response.cookies.set(key, value, options);
                }
            }
        );

        return response;

    } catch (error: any) {
        console.error('SignIn error:', error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}