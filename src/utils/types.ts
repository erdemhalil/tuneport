import type { DownloadJobStatus, DownloadResult } from "~/server/queue/types";
import type { YouTubeSearchResult } from "~/server/services/youtubeService";
export type { DownloadJobStatus, DownloadResult, YouTubeSearchResult };

/** Create a download ID from user ID, video ID, and current timestamp. */
export function createDownloadId(userId: string, videoId: string): string {
  return `${userId}-${videoId}-${Date.now()}`;
}

/** Check whether a download/job ID belongs to the given user. */
export function isOwnedByUser(id: string, userId: string): boolean {
  return id.startsWith(userId + "-");
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  track_count: number;
  owner: string;
  type: "liked_songs" | "playlist";
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image: string | null;
  };
  duration_ms: number;
  explicit?: boolean;
  added_at?: string;
  spotify_url?: string;
}

export interface DownloadJob {
  jobId: string;
  videoId: string;
  trackName: string;
  artistName: string;
  allArtists?: string[];
  artwork?: string;
  status: DownloadJobStatus;
  progress: number;
  result?: DownloadResult;
  failedReason?: string;
  error?: string;
}

export type DownloadJobInput = Pick<
  DownloadJob,
  "jobId" | "videoId" | "trackName" | "artistName" | "allArtists" | "artwork"
>;
