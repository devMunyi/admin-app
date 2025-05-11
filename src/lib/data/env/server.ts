import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_NAME: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),
    REDIS_TOKEN: z.string().min(1),
    SINGLE_SESSION: z.coerce.boolean().default(true),
    SESSION_EXPIRATION_SECONDS: z.coerce.number().default(15),
    COOKIE_SESSION_KEY: z.string().default("session-id"),
    COUNTRY_CODE: z.string().default("254"),
    // DISCORD_CLIENT_ID: z.string().optional(),
    // DISCORD_CLIENT_SECRET: z.string().optional(),
    // OAUTH_REDIRECT_URL_BASE: z.string().url(),
    // GITHUB_CLIENT_ID: z.string().optional(),
    // GITHUB_CLIENT_SECRET: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
