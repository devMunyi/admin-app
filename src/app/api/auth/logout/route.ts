// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { removeUserFromSession } from '@/lib/auth/session';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const callbackUrl = searchParams.get('callbackUrl') || '/signin';
        const cookieStore = await cookies();

        // Create a response that will be used for both API and redirect
        const response = new NextResponse();

        // Remove session and clear cookies
        await removeUserFromSession({
            get: (key) => cookieStore.get(key),
            delete: (key) => {
                response.cookies.delete(key);
            }
        });

        // For API calls, return JSON response
        if (request.headers.get('accept')?.includes('application/json')) {
            return NextResponse.json(
                { success: true, redirectTo: callbackUrl },
                { headers: response.headers }
            );
        }

        // For regular browser requests, perform redirect
        return NextResponse.redirect(new URL(callbackUrl, request.url), {
            headers: response.headers
        });

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}