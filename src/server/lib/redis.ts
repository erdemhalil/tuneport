import IORedis from "ioredis";
import { env } from "~/env";

let _connection: IORedis | null = null;

/**
 * Lazy Redis connection getter. Defers IORedis instantiation until first use,
 * avoiding network connections at import time. Subsequent calls return the
 * same singleton instance.
 */
export function getRedisConnection(): IORedis {
  if (!_connection) {
    _connection = new IORedis({
      host: env.REDIS_HOST ?? "localhost",
      port: parseInt(env.REDIS_PORT ?? "6379"),
      password: env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }
  return _connection;
}
