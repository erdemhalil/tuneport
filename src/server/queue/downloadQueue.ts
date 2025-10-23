import { Queue, type Job, type JobProgress } from "bullmq";
import downloadWorker from "../workers/downloadWorker";
import { redisConnection } from "../lib/redis";
import type { DownloadJobData, DownloadResult } from "./types";

export const downloadQueue = new Queue("youtube-downloads", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

downloadWorker.on("completed", (job: Job<DownloadJobData>, result: DownloadResult) => {
  console.log(
    `✅ Download completed: ${job.data.trackName} by ${job.data.artistName} (${result.fileSize} bytes)`,
  );
});

downloadWorker.on("failed", (job: Job<DownloadJobData> | undefined, err: Error) => {
  if (job) {
    console.error(
      `❌ Job FAILED: ${job.data.trackName} by ${job.data.artistName} - ${err.message}`,
    );
  } else {
    console.error(`❌ Job FAILED: ${err.message}`);
  }
});

downloadWorker.on("progress", (job: Job<DownloadJobData>, progress: JobProgress) => {
  const progressNum = typeof progress === 'number' ? progress : 0;
  if (progressNum > 0) {
    console.log(
      `📊 Download progress for ${job.data.trackName}: ${progressNum.toFixed(1)}%`,
    );
  }
});
