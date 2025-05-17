// src/lib/auth/session.ts
import { z } from "zod";
import { nanoid } from "nanoid";
import { UserRoles } from "@/db/enums";
import { redisClient } from "../redis";
import { env } from "../services/env/server";

// Session configuration
const SESSION_EXPIRATION_SECONDS = env.SESSION_EXPIRATION_SECONDS;
const APP_NAME = env.APP_NAME;
const COOKIE_SESSION_KEY = env.COOKIE_SESSION_KEY;
const SINGLE_SESSION = env.SINGLE_SESSION;
const SERVER_SESSION_KEY_PREFIX = `${APP_NAME}_sess_`;

// Session schema validation
const sessionSchema = z.object({
  id: z.number(),
  role: z.enum(Object.values(UserRoles) as [string, ...string[]]),
  password_expiry: z.coerce.date(),
});

export type UserSession = z.infer<typeof sessionSchema>;

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax" | "none";
      expires?: Date;
      maxAge?: number;
      path?: string;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
}

export type CookieHelpers = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: Date;
      maxAge?: number;
      path?: string;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
}


export async function createUserSession(
  user: UserSession,
  cookies: Pick<CookieHelpers, "set">
): Promise<void> {
  const sessionId = nanoid(32);

  await redisClient.setEx(
    `${SERVER_SESSION_KEY_PREFIX}${sessionId}`,
    SESSION_EXPIRATION_SECONDS,
    JSON.stringify(sessionSchema.parse(user))
  );

  setSessionCookie(sessionId, cookies);
}

export async function removeUserFromSession(
  cookies: Pick<CookieHelpers, "get" | "delete">
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;

  await redisClient.del(`${SERVER_SESSION_KEY_PREFIX}${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

// Helper function to set session cookie
function setSessionCookie(sessionId: string, cookies: Pick<CookieHelpers, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION_SECONDS,
    expires: new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000),
  });
}

export async function getUserFromSession(
  cookies: Pick<Cookies, "get">
): Promise<UserSession | null> {

  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (!sessionId) return null;

  const userSessionId = await getUserSessionById(sessionId);

  return userSessionId;
}

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return null;

  const user = await getUserSessionById(sessionId);
  if (!user) return null;

  // Update Redis expiration
  await redisClient.setEx(
    `${SERVER_SESSION_KEY_PREFIX}${sessionId}`,
    SESSION_EXPIRATION_SECONDS,
    JSON.stringify(user)
  );

  // refresh cookie expiration
  setSessionCookie(sessionId, cookies);
}

export async function refreshUserSession(
  cookies: Pick<Cookies, "get" | "set">
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;

  const user = await getUserSessionById(sessionId);
  if (!user) return;

  await redisClient.setEx(
    `${SERVER_SESSION_KEY_PREFIX}${sessionId}`,
    SESSION_EXPIRATION_SECONDS,
    JSON.stringify(user)
  );

  setSessionCookie(sessionId, cookies);
}

export async function destroyUserSession(
  cookies: Pick<Cookies, "get" | "delete">
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;

  await redisClient.del(`${SERVER_SESSION_KEY_PREFIX}${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

// Internal helper function
async function getUserSessionById(sessionId: string): Promise<UserSession | null> {
  const rawUser = await redisClient.get(`${SERVER_SESSION_KEY_PREFIX}${sessionId}`);
  if (!rawUser) return null;

  const result = sessionSchema.safeParse(JSON.parse(rawUser));
  return result.success ? result.data : null;
}