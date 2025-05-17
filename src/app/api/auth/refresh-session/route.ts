// src/app/api/auth/refresh-session/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateUserSessionExpiration } from "@/lib/auth/session";
import { env } from "@/lib/services/env/server";
const COOKIE_SESSION_KEY = env.COOKIE_SESSION_KEY;

export async function GET(request: NextRequest) {
    const sessionId = request.cookies.get(COOKIE_SESSION_KEY)?.value;

    if (!sessionId) {
        return new NextResponse(null, { status: 204 }); // No content
    }

    try {
        const response = new NextResponse(null, { status: 204 });

        await updateUserSessionExpiration({
            get: () => ({ name: COOKIE_SESSION_KEY, value: sessionId }),
            set: (key, value, options) => {
                response.cookies.set(key, value, options);
            }
        });

        return response;
    } catch (error) {
        console.error("Session refresh failed:", error);
        return new NextResponse(null, { status: 204 }); // Still no content
    }
}