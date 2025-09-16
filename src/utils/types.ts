// Shared types for the application
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  track_count: number;
  owner: string;
  type: 'liked_songs' | 'playlist';
  // For playlists, this will be the playlist ID
  // For liked songs, this can be a special identifier
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image?: string;
  };
  duration_ms: number;
  explicit?: boolean;
  added_at?: string;
  spotify_url?: string;
}