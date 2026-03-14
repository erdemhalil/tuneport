import { z } from "zod";

export type DownloadJobStatus =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed"
  | "paused"
  | "unknown"
  | "prioritized"
  | "wait-children"
  | "waiting-children"
  | "not_found"
  | "error";

export interface DownloadJobData {
  videoId: string;
  trackName: string;
  artistName: string;
  allArtists?: string[];
  artwork?: string;
  useArtistInFilename?: boolean;
  userId: string;
  jobId: string;
}

/** Zod schema for runtime validation of DownloadResult (e.g. from BullMQ returnvalue) */
export const downloadResultSchema = z.object({
  videoId: z.string(),
  trackName: z.string(),
  artistName: z.string(),
  downloadId: z.string(),
  fileSize: z.number(),
  duration: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type DownloadResult = z.infer<typeof downloadResultSchema>;
