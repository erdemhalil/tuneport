import { Queue, type ConnectionOptions } from "bullmq";
import { getRedisConnection } from "../lib/redis";

let _queue: Queue | null = null;

/**
 * Lazy BullMQ queue getter. Defers Queue instantiation until first use so no
 * network connections are opened at import time. The matching worker lives in
 * `workers/downloadWorker.ts`; event handlers are wired up in `init.ts`.
 */
export function getDownloadQueue(): Queue {
  _queue ??= new Queue("youtube-downloads", {
    connection: getRedisConnection() as unknown as ConnectionOptions,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 20,
    },
  });
  return _queue;
}
