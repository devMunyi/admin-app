import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_COUNTRY_CODE: z.string().default("254"),
    NEXT_PUBLIC_COOKIE_SESSION_KEY: z.string().default("session-id"),
    NEXT_PUBLIC_SESSION_EXPIRATION_SECONDS: z.coerce.number().default(15),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_COUNTRY_CODE: undefined,
    NEXT_PUBLIC_COOKIE_SESSION_KEY: undefined,
    NEXT_PUBLIC_SESSION_EXPIRATION_SECONDS: undefined,
  },
  emptyStringAsUndefined: true,
});
