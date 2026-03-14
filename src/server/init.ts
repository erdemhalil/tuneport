import type { Job } from "bullmq";
import { getDownloadWorker } from "./workers/downloadWorker";
import type { DownloadJobData } from "./queue/types";

/**
 * Server-side initialization: registers BullMQ worker event handlers.
 * This module is imported as a side-effect from the tRPC API handler
 * (`pages/api/trpc/[trpc].ts`) to ensure handlers are wired up before
 * any requests are processed.
 */
getDownloadWorker().on(
  "failed",
  (job: Job<DownloadJobData> | undefined, err: Error) => {
    if (job) {
      console.error(
        `Download job failed: ${job.data.trackName} by ${job.data.artistName} - ${err.message}`,
      );
    } else {
      console.error(`Download job failed: ${err.message}`);
    }
  },
);
