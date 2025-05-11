import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
     NEXT_PUBLIC_COUNTRY_CODE: z.string().default("254"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_COUNTRY_CODE: undefined
  },
  emptyStringAsUndefined: true,
});
