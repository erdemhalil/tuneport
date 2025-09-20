export interface DownloadJobData {
  videoId: string;
  trackName: string;
  artistName: string;
  allArtists?: string[];
  artwork?: string;
  userId: string;
  jobId: string;
}

export interface DownloadResult {
  videoId: string;
  trackName: string;
  artistName: string;
  downloadId: string;
  fileSize: number;
  duration: number;
  success: boolean;
  error?: string;
}
