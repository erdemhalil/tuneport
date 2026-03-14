import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Session } from "next-auth";
import type { Collection, Track } from "~/utils/types";

export const spotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({
    name: z.string(),
    images: z.array(z.object({ url: z.string() })),
  }),
  duration_ms: z.number(),
  explicit: z.boolean(),
  external_urls: z.object({
    spotify: z.string(),
  }),
});

export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;

const spotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(z.object({ url: z.string() })),
  tracks: z.object({ total: z.number() }),
  owner: z.object({ display_name: z.string() }),
});

export type SpotifyPlaylist = z.infer<typeof spotifyPlaylistSchema>;

const likedSongsResponseSchema = z.object({
  items: z.array(
    z.object({
      track: spotifyTrackSchema,
      added_at: z.string(),
    }),
  ),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

const playlistsResponseSchema = z.object({
  items: z.array(spotifyPlaylistSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

const playlistTracksResponseSchema = z.object({
  items: z.array(
    z.object({
      track: spotifyTrackSchema,
      added_at: z.string(),
    }),
  ),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export function mapSpotifyTrack(item: {
  track: SpotifyTrack;
  added_at?: string;
}): Track {
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
}

export class SpotifyService {
  private session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  private async fetchSpotifyApi(url: string): Promise<Response> {
    if (!this.session.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication failed - please re-authenticate",
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.session.accessToken}`,
        },
      });
    } catch (networkError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API network error: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
        cause: networkError,
      });
    }

    if (response.status === 401) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication failed - please re-authenticate",
      });
    }

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify API error: ${response.status} ${response.statusText}`,
      });
    }

    return response;
  }

  private parseApiResponse<T>(
    json: unknown,
    schema: z.ZodType<T>,
    label: string,
  ): T {
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(
        `Spotify ${label} API response validation failed:`,
        parsed.error.issues,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Spotify ${label} API returned unexpected response shape`,
      });
    }
    return parsed.data;
  }

  async getLikedSongs(
    limit = 50,
    offset = 0,
  ): Promise<{
    tracks: Track[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;
    const response = await this.fetchSpotifyApi(url);
    const json: unknown = await response.json();
    const data = this.parseApiResponse(
      json,
      likedSongsResponseSchema,
      "Liked Songs",
    );
    return {
      tracks: data.items.map(mapSpotifyTrack),
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
    const response = await this.fetchSpotifyApi(url);
    const json: unknown = await response.json();
    const data = this.parseApiResponse(
      json,
      playlistsResponseSchema,
      "Playlists",
    );
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
    tracks: Track[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;
    const response = await this.fetchSpotifyApi(url);
    const json: unknown = await response.json();
    const data = this.parseApiResponse(
      json,
      playlistTracksResponseSchema,
      "Playlist Tracks",
    );
    return {
      tracks: data.items.map(mapSpotifyTrack),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  async getCollections(
    limit = 20,
    offset = 0,
  ): Promise<{
    collections: Collection[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const likedSongsResponse = await this.fetchSpotifyApi(
      "https://api.spotify.com/v1/me/tracks?limit=1&offset=0",
    );
    const likedSongsJson: unknown = await likedSongsResponse.json();
    const likedSongsData = this.parseApiResponse(
      likedSongsJson,
      likedSongsResponseSchema,
      "Liked Songs",
    );

    const playlistsData = await this.getPlaylists(limit, offset);

    const collections: Collection[] = [
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
      total: 1 + playlistsData.total, // 1 for Liked Songs + total playlists from API
      limit,
      offset,
    };
  }

  async getCollectionTracks(
    collectionId: string,
    limit = 50,
    offset = 0,
  ): Promise<{
    tracks: Track[];
    total: number;
    limit: number;
    offset: number;
  }> {
    if (collectionId === "liked_songs") {
      return this.getLikedSongs(limit, offset);
    }
    return this.getPlaylistTracks(collectionId, limit, offset);
  }
}
