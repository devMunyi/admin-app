// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { env } from "./lib/services/env/client";

const COOKIE_SESSION_KEY = env.NEXT_PUBLIC_COOKIE_SESSION_KEY;
const SESSION_REFRESH_THROTTLE = 60 * 5; // 5 minutes in seconds
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/change-password",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(COOKIE_SESSION_KEY);
  if (!sessionCookie) {
    return handleAuthFailure(request);
  }

  // Prepare response
  const response = NextResponse.next();

  // Check if we need to refresh the session
  const lastRefresh = request.cookies.get('session_last_refresh');
  const shouldRefresh = !lastRefresh ||
    (Date.now() - new Date(lastRefresh.value).getTime()) > SESSION_REFRESH_THROTTLE * 1000;

  if (shouldRefresh) {
    // Set throttle cookie to prevent immediate re-refresh
    response.cookies.set('session_last_refresh', new Date().toISOString(), {
      maxAge: SESSION_REFRESH_THROTTLE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // Refresh session cookie expiration
    response.cookies.set(COOKIE_SESSION_KEY, sessionCookie.value, {
      maxAge: 900,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // Refresh session in background without blocking
    await refreshSessionInBackground(origin, sessionCookie.value);
  }

  return response;
}

// Non-blocking session refresh
async function refreshSessionInBackground(origin: string, sessionId: string) {
  try {
    await fetch(`${origin}/api/auth/refresh-session`, {
      method: 'GET',
      headers: {
        'Cookie': `${COOKIE_SESSION_KEY}=${sessionId}`
      },
      // Important: don't block middleware execution
      keepalive: true
    });
  } catch (error) {
    console.error('Background session refresh failed:', error);
  }
}


async function handleAuthFailure(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return new NextResponse("Session Expired!", { status: 401 });
  }

  const callbackUrl = encodeURIComponent(pathname.replace(/^\/api/, ""));
  return NextResponse.redirect(
    new URL(`/signin?callbackUrl=${callbackUrl}`, request.url)
  );
}

function isPrivateRoute(pathname: string): boolean {
  return !PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};