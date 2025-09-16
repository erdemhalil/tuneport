import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Collection } from "~/utils/types";

// Helper function to refresh Spotify access token
async function refreshSpotifyToken(
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
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
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

// Session type for Spotify operations
interface SpotifySession {
  accessToken?: string;
  refreshToken?: string;
}

// Helper function to make authenticated Spotify API request with token refresh
async function makeSpotifyRequest(
  url: string,
  session: SpotifySession,
): Promise<Response> {
  // First try with current access token
  if (session.accessToken) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    // If token is still valid, return the response
    if (response.status !== 401) {
      return response;
    }
  }

  // Token is invalid/expired, try to refresh
  if (session.refreshToken) {
    console.log("Access token expired, attempting refresh...");
    const refreshResult = await refreshSpotifyToken(session.refreshToken);
    if (refreshResult) {
      console.log("Token refresh successful, retrying request...");
      // Retry the request with the new token
      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${refreshResult.access_token}`,
        },
      });
    }
  }

  // If we get here, we couldn't refresh the token
  throw new Error("Authentication failed - please re-authenticate");
}

interface SpotifyTrack {
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

interface SpotifyPlaylist {
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

interface LikedSongsResponse {
  items: Array<{
    track: SpotifyTrack;
    added_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

interface PlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
}

interface PlaylistTracksResponse {
  items: Array<{
    track: SpotifyTrack;
    added_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

export const spotifyRouter = createTRPCRouter({
  likedSongs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await makeSpotifyRequest(
        `https://api.spotify.com/v1/me/tracks?limit=${input.limit}&offset=${input.offset}`,
        ctx.session,
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = (await response.json()) as LikedSongsResponse;

      return {
        tracks: data.items.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist) => artist.name),
          album: {
            name: item.track.album.name,
            image: item.track.album.images[0]?.url,
          },
          duration_ms: item.track.duration_ms,
          explicit: item.track.explicit,
          added_at: item.added_at,
          spotify_url: item.track.external_urls.spotify,
        })),
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      };
    }),

  playlists: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await makeSpotifyRequest(
        `https://api.spotify.com/v1/me/playlists?limit=${input.limit}&offset=${input.offset}`,
        ctx.session,
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = (await response.json()) as PlaylistsResponse;

      return {
        playlists: data.items.map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          image: playlist.images?.[0]?.url ?? null,
          track_count: playlist.tracks.total,
          owner: playlist.owner.display_name,
        })),
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      };
    }),

  playlistTracks: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await makeSpotifyRequest(
        `https://api.spotify.com/v1/playlists/${input.id}/tracks?limit=${input.limit}&offset=${input.offset}`,
        ctx.session,
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = (await response.json()) as PlaylistTracksResponse;

      return {
        tracks: data.items.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist) => artist.name),
          album: {
            name: item.track.album.name,
            image: item.track.album.images[0]?.url,
          },
          duration_ms: item.track.duration_ms,
          explicit: item.track.explicit,
          added_at: item.added_at,
          spotify_url: item.track.external_urls.spotify,
        })),
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      };
    }),

  collections: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Fetch liked songs count first
      const likedSongsResponse = await makeSpotifyRequest(
        "https://api.spotify.com/v1/me/tracks?limit=1&offset=0",
        ctx.session,
      );

      if (!likedSongsResponse.ok) {
        throw new Error(`Spotify API error: ${likedSongsResponse.status}`);
      }

      const likedSongsData = (await likedSongsResponse.json()) as LikedSongsResponse;

      // Fetch playlists
      const playlistsResponse = await makeSpotifyRequest(
        `https://api.spotify.com/v1/me/playlists?limit=${input.limit}&offset=${input.offset}`,
        ctx.session,
      );

      if (!playlistsResponse.ok) {
        throw new Error(`Spotify API error: ${playlistsResponse.status}`);
      }

      const playlistsData = (await playlistsResponse.json()) as PlaylistsResponse;

      // Create collections array starting with Liked Songs
      const collections: Collection[] = [
        {
          id: "liked_songs",
          name: "Liked Songs",
          description: "Your favorite tracks",
          image: null, // Liked Songs doesn't have a specific image
          track_count: likedSongsData.total,
          owner: "You",
          type: "liked_songs",
        },
        // Add playlists
        ...playlistsData.items.map((playlist) => ({
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
        limit: input.limit,
        offset: input.offset,
      };
    }),

  collectionTracks: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.collectionId === "liked_songs") {
        // Fetch liked songs
        const response = await makeSpotifyRequest(
          `https://api.spotify.com/v1/me/tracks?limit=${input.limit}&offset=${input.offset}`,
          ctx.session,
        );

        if (!response.ok) {
          throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = (await response.json()) as LikedSongsResponse;

        return {
          tracks: data.items.map((item) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((artist) => artist.name),
            album: {
              name: item.track.album.name,
              image: item.track.album.images[0]?.url,
            },
            duration_ms: item.track.duration_ms,
            explicit: item.track.explicit,
            added_at: item.added_at,
            spotify_url: item.track.external_urls.spotify,
          })),
          total: data.total,
          limit: data.limit,
          offset: data.offset,
        };
      } else {
        // Fetch playlist tracks
        const response = await makeSpotifyRequest(
          `https://api.spotify.com/v1/playlists/${input.collectionId}/tracks?limit=${input.limit}&offset=${input.offset}`,
          ctx.session,
        );

        if (!response.ok) {
          throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = (await response.json()) as PlaylistTracksResponse;

        return {
          tracks: data.items.map((item) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((artist) => artist.name),
            album: {
              name: item.track.album.name,
              image: item.track.album.images[0]?.url,
            },
            duration_ms: item.track.duration_ms,
            explicit: item.track.explicit,
            added_at: item.added_at,
            spotify_url: item.track.external_urls.spotify,
          })),
          total: data.total,
          limit: data.limit,
          offset: data.offset,
        };
      }
    }),
});
