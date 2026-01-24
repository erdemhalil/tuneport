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
