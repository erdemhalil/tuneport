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

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  confidence: number;
  explicit: boolean;
}

export interface DownloadJob {
  jobId: string;
  videoId: string;
  trackName: string;
  artistName: string;
  allArtists?: string[];
  artwork?: string;
  status: string;
  progress: number;
  result?: {
    videoId: string;
    trackName: string;
    artistName: string;
    downloadId: string;
    fileSize: number;
    duration: number;
    success: boolean;
    error?: string;
  };
  failedReason?: string;
  error?: string;
}

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
