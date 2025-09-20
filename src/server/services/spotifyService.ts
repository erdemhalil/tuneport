import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import type { Session } from "next-auth";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
}

export interface LikedSongsResponse {
  items: Array<{
    track: SpotifyTrack;
    added_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

export interface PlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlaylistTracksResponse {
  items: Array<{
    track: SpotifyTrack;
    added_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyCollection {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  track_count: number;
  owner: string;
  type: "liked_songs" | "playlist";
}

export interface SpotifyTrackData {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image: string | null;
  };
  duration_ms: number;
  explicit: boolean;
  added_at?: string;
  spotify_url: string;
}

export class SpotifyService {
  private session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  private async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; expires_in: number } | null> {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: env.SPOTIFY_CLIENT_ID,
          client_secret: env.SPOTIFY_CLIENT_SECRET,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          access_token: string;
          expires_in: number;
        };
        return data;
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  private async makeRequest(url: string): Promise<Response> {
    const session = this.session as Session & {
      accessToken?: string;
      refreshToken?: string;
    };

    if (session.accessToken) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.status !== 401) {
        return response;
      }
    }

    if (session.refreshToken) {
      console.log("Access token expired, attempting refresh...");
      const refreshResult = await this.refreshToken(session.refreshToken);
      if (refreshResult) {
        console.log("Token refresh successful, retrying request...");
        return await fetch(url, {
          headers: {
            Authorization: `Bearer ${refreshResult.access_token}`,
          },
        });
      }
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication failed - please re-authenticate",
    });
  }

  private mapSpotifyTrack = (item: {
    track: SpotifyTrack;
    added_at?: string;
  }): SpotifyTrackData => {
    const track = item.track;
    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: {
        name: track.album.name,
        image: track.album.images[0]?.url ?? null,
      },
      duration_ms: track.duration_ms,
      explicit: track.explicit,
      added_at: item.added_at,
      spotify_url: track.external_urls.spotify,
    };
  };

  async getLikedSongs(
    limit = 50,
    offset = 0,
  ): Promise<{
    tracks: SpotifyTrackData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API error: ${response.status}`,
      });
    }

    const data = (await response.json()) as LikedSongsResponse;
    return {
      tracks: data.items.map(this.mapSpotifyTrack),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  async getPlaylists(
    limit = 20,
    offset = 0,
  ): Promise<{
    playlists: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API error: ${response.status}`,
      });
    }

    const data = (await response.json()) as PlaylistsResponse;
    return {
      playlists: data.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        tracks: playlist.tracks,
        owner: playlist.owner,
      })),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  async getPlaylistTracks(
    playlistId: string,
    limit = 50,
    offset = 0,
  ): Promise<{
    tracks: SpotifyTrackData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API error: ${response.status}`,
      });
    }

    const data = (await response.json()) as PlaylistTracksResponse;
    return {
      tracks: data.items.map(this.mapSpotifyTrack),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  async getCollections(
    limit = 20,
    offset = 0,
  ): Promise<{
    collections: SpotifyCollection[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Get liked songs count
    const likedSongsResponse = await this.makeRequest(
      "https://api.spotify.com/v1/me/tracks?limit=1&offset=0",
    );
    if (!likedSongsResponse.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API error: ${likedSongsResponse.status}`,
      });
    }
    const likedSongsData =
      (await likedSongsResponse.json()) as LikedSongsResponse;

    // Get playlists
    const playlistsData = await this.getPlaylists(limit, offset);

    // Create collections array
    const collections: SpotifyCollection[] = [
      {
        id: "liked_songs",
        name: "Liked Songs",
        description: "Your favorite tracks",
        image: null,
        track_count: likedSongsData.total,
        owner: "You",
        type: "liked_songs",
      },
      ...playlistsData.playlists.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image: playlist.images?.[0]?.url ?? null,
        track_count: playlist.tracks.total,
        owner: playlist.owner.display_name,
        type: "playlist" as const,
      })),
    ];

    return {
      collections,
      total: collections.length,
      limit,
      offset,
    };
  }

  async getCollectionTracks(
    collectionId: string,
    limit = 50,
    offset = 0,
  ): Promise<{
    tracks: SpotifyTrackData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (collectionId === "liked_songs") {
      return this.getLikedSongs(limit, offset);
    } else {
      return this.getPlaylistTracks(collectionId, limit, offset);
    }
  }
}
