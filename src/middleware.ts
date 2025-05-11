import { NextResponse, type NextRequest } from "next/server";
import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./lib/auth/session";

const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/change-password",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const response = (await middlewareAuth(request)) ?? NextResponse.next();

  await updateUserSessionExpiration({
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value });
    },
    get: (key) => {
      const value = request.cookies.get(key)?.value;
      return value ? { name: key, value } : undefined;
    },
  });

  return response;
}

async function middlewareAuth(request: NextRequest) {
  const user = await getUserFromSession(request.cookies);
  const { pathname } = request.nextUrl;

  // Check private routes
  if (isPrivateRoute(pathname)) {
    if (!user) {
      const callbackUrl = encodeURIComponent(pathname);
      // strip out api if exists from the callback url
      const callbackUrlWithoutApi = callbackUrl.replace(/\/api\//, "/");
      const redirectUrl = new URL(`/signin?callbackUrl=${callbackUrlWithoutApi}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }


    // // Skip password expiry check if already on /change-password
    // if (user.password_expiry && new Date(user.password_expiry) < new Date() && pathname !== "/change-password") {
    //   return NextResponse.redirect(new URL("/change-password", request.url));
    // }

  }
}

// Helper functions to check route types
function isPrivateRoute(pathname: string): boolean {
  // Implement your private route logic here
  return !PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
