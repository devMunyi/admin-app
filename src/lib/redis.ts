// lib/redis.ts
import { createClient, RedisClientType } from 'redis';

const localRedisUrl = process.env.LOCAL_REDIS_URL || 'redis://localhost:6379';

let _redisClient: RedisClientType | null = null;

const getRedisClient = (): RedisClientType => {
    if (!_redisClient) {
        _redisClient = createClient({ url: localRedisUrl });

        _redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        _redisClient.connect().catch((err) => {
            console.error('Redis connection failed:', err);
        });
    }

    return _redisClient;
};


export const redisClient = getRedisClient();