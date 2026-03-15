import IORedis from "ioredis";
import { type ConnectionOptions } from "bullmq";
import { env } from "~/env";

let _connection: IORedis | null = null;

function getRedisConfig() {
  return {
    host: env.REDIS_HOST ?? "localhost",
    port: parseInt(env.REDIS_PORT ?? "6379", 10),
    password: env.REDIS_PASSWORD,
  };
}

/**
 * Lazy Redis connection getter. Defers IORedis instantiation until first use,
 * avoiding network connections at import time. Subsequent calls return the
 * same singleton instance.
 */
export function getRedisConnection(): IORedis {
  _connection ??= new IORedis({
    ...getRedisConfig(),
    maxRetriesPerRequest: null,
  });
  return _connection;
}

/**
 * Returns BullMQ connection options directly to avoid cross-package ioredis
 * type conflicts.
 */
export function getBullMQConnection(): ConnectionOptions {
  return {
    ...getRedisConfig(),
    maxRetriesPerRequest: null,
  };
}
