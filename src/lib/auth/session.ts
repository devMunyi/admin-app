export const runtime = "bunj";
import { z } from "zod";
import { redisClient } from "../redis";
import { env } from "../data/env/server";
import { nanoid } from "nanoid";
import { UserRoles } from "@/db/enums";

// fifteen seconds
const SESSION_EXPIRATION_SECONDS = env.SESSION_EXPIRATION_SECONDS;
const APP_NAME = env.APP_NAME;
const COOKIE_SESSION_KEY = env.COOKIE_SESSION_KEY;
// const SINGLE_SESSION = env.SINGLE_SESSION;
const SERVER_SESSION_KEY_PREFIX = `${APP_NAME}_sess_`;

const sessionSchema = z.object({
  id: z.number(),
  role: z.enum(Object.values(UserRoles) as [string, ...string[]]),
  password_expiry: z.coerce.date(),
});

type UserSession = z.infer<typeof sessionSchema>;
export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

export function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionId == null) return null;

  return getUserSessionById(sessionId);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });
}

export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">
) {
  const sessionId = nanoid(32);
  await redisClient.set(
    `${SERVER_SESSION_KEY_PREFIX}${sessionId}`,
    sessionSchema.parse(user),
    {
      ex: SESSION_EXPIRATION_SECONDS,
    }
  );

  setCookie(sessionId, cookies);
}

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  const user = await getUserSessionById(sessionId);
  if (user == null) return;

  await redisClient.set(`${SERVER_SESSION_KEY_PREFIX}${sessionId}`, user, {
    ex: SESSION_EXPIRATION_SECONDS,
  });
  setCookie(sessionId, cookies);
}

export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  await redisClient.del(`${SERVER_SESSION_KEY_PREFIX}${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(
    `${SERVER_SESSION_KEY_PREFIX}${sessionId}`
  );

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}
