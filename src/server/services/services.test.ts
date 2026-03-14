import { describe, it, expect, vi } from "vitest";
import { mapBullMQState } from "~/server/services/downloadService";
import {
  mapSpotifyTrack,
  SpotifyService,
  type SpotifyTrack,
} from "~/server/services/spotifyService";
import type { Session } from "next-auth";

describe("mapBullMQState", () => {
  it("maps 'waiting' to 'waiting'", () => {
    expect(mapBullMQState("waiting")).toBe("waiting");
  });

  it("maps 'active' to 'active'", () => {
    expect(mapBullMQState("active")).toBe("active");
  });

  it("maps 'completed' to 'completed'", () => {
    expect(mapBullMQState("completed")).toBe("completed");
  });

  it("maps 'failed' to 'failed'", () => {
    expect(mapBullMQState("failed")).toBe("failed");
  });

  it("maps 'delayed' to 'delayed'", () => {
    expect(mapBullMQState("delayed")).toBe("delayed");
  });

  it("maps 'paused' to 'paused'", () => {
    expect(mapBullMQState("paused")).toBe("paused");
  });

  it("maps 'prioritized' to 'prioritized'", () => {
    expect(mapBullMQState("prioritized")).toBe("prioritized");
  });

  it("maps unknown states to 'unknown'", () => {
    expect(mapBullMQState("nonexistent")).toBe("unknown");
    expect(mapBullMQState("")).toBe("unknown");
    expect(mapBullMQState("ACTIVE")).toBe("unknown"); // case-sensitive
  });

  it("maps 'unknown' to 'unknown'", () => {
    expect(mapBullMQState("unknown")).toBe("unknown");
  });
});

describe("mapSpotifyTrack", () => {
  const baseTrack: SpotifyTrack = {
    id: "track-123",
    name: "Test Song",
    artists: [{ name: "Artist A" }, { name: "Artist B" }],
    album: {
      name: "Test Album",
      images: [{ url: "https://example.com/cover.jpg" }],
    },
    duration_ms: 210_000,
    explicit: true,
    external_urls: { spotify: "https://open.spotify.com/track/track-123" },
  };

  it("maps a Spotify track to the internal Track shape", () => {
    const result = mapSpotifyTrack({ track: baseTrack });

    expect(result).toEqual({
      id: "track-123",
      name: "Test Song",
      artists: ["Artist A", "Artist B"],
      album: {
        name: "Test Album",
        image: "https://example.com/cover.jpg",
      },
      duration_ms: 210_000,
      explicit: true,
      added_at: undefined,
      spotify_url: "https://open.spotify.com/track/track-123",
    });
  });

  it("includes added_at when provided", () => {
    const result = mapSpotifyTrack({
      track: baseTrack,
      added_at: "2024-01-15T12:00:00Z",
    });
    expect(result.added_at).toBe("2024-01-15T12:00:00Z");
  });

  it("returns null for album image when no images exist", () => {
    const trackNoImages = {
      ...baseTrack,
      album: { ...baseTrack.album, images: [] },
    };
    const result = mapSpotifyTrack({ track: trackNoImages });
    expect(result.album.image).toBeNull();
  });

  it("handles single artist", () => {
    const singleArtist = { ...baseTrack, artists: [{ name: "Solo" }] };
    const result = mapSpotifyTrack({ track: singleArtist });
    expect(result.artists).toEqual(["Solo"]);
  });

  it("maps explicit flag correctly", () => {
    const cleanTrack = { ...baseTrack, explicit: false };
    expect(mapSpotifyTrack({ track: cleanTrack }).explicit).toBe(false);
    expect(mapSpotifyTrack({ track: baseTrack }).explicit).toBe(true);
  });
});

describe("SpotifyService.getCollections", () => {
  it("accepts playlists where owner.display_name and images are null", async () => {
    const originalFetch = global.fetch;

    const likedSongsPayload = {
      items: [],
      total: 42,
      limit: 1,
      offset: 0,
    };

    const playlistsPayload = {
      items: [
        {
          id: "playlist-1",
          name: "No Owner Name Playlist",
          description: null,
          images: null,
          tracks: { total: 3 },
          owner: { display_name: null },
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(likedSongsPayload), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(playlistsPayload), { status: 200 }),
      );

    global.fetch = fetchMock;

    try {
      const service = new SpotifyService({ accessToken: "token" } as Session);
      const result = await service.getCollections(20, 0);

      expect(result.collections).toHaveLength(2);
      expect(result.collections[1]?.owner).toBe("Spotify User");
      expect(result.collections[1]?.image).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
