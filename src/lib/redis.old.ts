import { Redis } from "@upstash/redis";
import { env } from "./services/env/server";

// Upstash Redis
export const redisUpstashClient = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});
