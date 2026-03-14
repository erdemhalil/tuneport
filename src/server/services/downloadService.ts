import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDownloadQueue } from "~/server/queue/downloadQueue";
import type {
  DownloadJobData,
  DownloadJobStatus,
  DownloadResult,
} from "~/server/queue/types";
import { downloadResultSchema } from "~/server/queue/types";
import { createDownloadId, isOwnedByUser } from "~/utils/types";
import { removeDownloadedFile } from "./redisService";

export function mapBullMQState(state: string): DownloadJobStatus {
  const validStates: Set<string> = new Set([
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
    "paused",
    "unknown",
    "prioritized",
    "wait-children",
    "waiting-children",
  ]);
  return validStates.has(state) ? (state as DownloadJobStatus) : "unknown";
}

export async function getDownloadStatus(
  jobIds: string[],
  userId: string,
): Promise<
  Array<{
    jobId: string;
    status: DownloadJobStatus;
    progress: number;
    result?: DownloadResult;
    failedReason?: string;
    error?: string;
  }>
> {
  // Filter to only jobs belonging to this user
  const userJobIds = jobIds.filter((id) => isOwnedByUser(id, userId));

  const jobs = await Promise.all(
    userJobIds.map(async (jobId) => {
      try {
        const job = await getDownloadQueue().getJob(jobId);
        if (!job) {
          return {
            jobId,
            status: "not_found" as const,
            progress: 0,
          };
        }

        const state = await job.getState();
        const progress = typeof job.progress === "number" ? job.progress : 0;

        const returnvalue = job.returnvalue as
          | Record<string, unknown>
          | undefined;
        const parsed = returnvalue
          ? downloadResultSchema.safeParse(returnvalue)
          : null;
        const result: DownloadResult | undefined = parsed?.success
          ? parsed.data
          : undefined;

        return {
          jobId,
          status: mapBullMQState(state),
          progress,
          result,
          failedReason: job.failedReason,
        };
      } catch (error) {
        return {
          jobId,
          status: "error" as const,
          progress: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  return jobs;
}

export async function cleanupDownloads(
  downloadIds: string[],
  userId: string,
): Promise<{
  cleaned: number;
}> {
  // Filter to only downloads belonging to this user
  const userDownloadIds = downloadIds.filter((id) => isOwnedByUser(id, userId));
  let cleaned = 0;

  for (const downloadId of userDownloadIds) {
    if (await removeDownloadedFile(downloadId)) {
      cleaned++;
    }
  }

  return { cleaned };
}

export const downloadTrackInputSchema = z.object({
  videoId: z.string(),
  trackName: z.string(),
  artistName: z.string(),
  allArtists: z.array(z.string()).optional(),
  artwork: z.string().optional(),
  useArtistInFilename: z.boolean().optional(),
});

export type DownloadTrackInput = z.infer<typeof downloadTrackInputSchema>;

export async function enqueueDownloads(
  tracks: DownloadTrackInput[],
  userId: string,
): Promise<{
  message: string;
  jobs: Array<{
    jobId: string;
    videoId: string;
    trackName: string;
    artistName: string;
    allArtists?: string[];
  }>;
}> {
  if (tracks.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No tracks provided for download",
    });
  }

  if (tracks.length > 50) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot download more than 50 tracks at once",
    });
  }

  const jobs = [];

  for (const track of tracks) {
    const jobData: DownloadJobData = {
      videoId: track.videoId,
      trackName: track.trackName,
      artistName: track.artistName,
      allArtists: track.allArtists,
      artwork: track.artwork,
      useArtistInFilename: track.useArtistInFilename,
      userId,
      jobId: createDownloadId(userId, track.videoId),
    };

    await getDownloadQueue().add(`download-${track.videoId}`, jobData, {
      jobId: jobData.jobId,
      priority: 0,
      delay: 0,
    });

    jobs.push({
      jobId: jobData.jobId,
      videoId: track.videoId,
      trackName: track.trackName,
      artistName: track.artistName,
      allArtists: track.allArtists,
    });
  }

  return {
    message: `Added ${jobs.length} tracks to download queue`,
    jobs,
  };
}
