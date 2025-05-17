// src/app/api/auth/current-user/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    try {
        // Get cookies from request
        const cookie = request.cookies.get(process.env.COOKIE_SESSION_KEY!);

        // Get session user
        const user = await getUserFromSession({
            get: (key) => cookie?.name === key ? cookie : undefined
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }
        // // Fetch full user data from the database
        // const fullUser = await prisma.users.findUnique({
        //     where: { id: user.id },
        //     select: {
        //         id: true,
        //         email: true,
        //         role: true,
        //         name: true,
        //         image: true,
        //         email_verified: true,
        //         password_expiry: true,
        //         status: true,
        //     },
        // });

        return NextResponse.json(user);

    } catch (error) {
        console.error('Current user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}