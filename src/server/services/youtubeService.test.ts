import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("~/env", () => ({
  env: {
    YOUTUBE_API_KEY: "test-youtube-api-key",
  },
}));

vi.mock("~/server/lib/redis", () => ({
  getRedisConnection: vi.fn(),
}));

import {
  calculateDurationConfidence,
  isYouTubeContentExplicit,
  isYouTubeContentClean,
  YouTubeService,
  type VideoMetadata,
} from "~/server/services/youtubeService";
import { getRedisConnection } from "~/server/lib/redis";
import type { Session } from "next-auth";

const mockedGetRedisConnection = vi.mocked(getRedisConnection);

describe("calculateDurationConfidence", () => {
  it("returns 100 for exact duration match", () => {
    expect(calculateDurationConfidence(180_000, 180)).toBe(100);
  });

  it("returns 100 for match within rounding (ms truncation)", () => {
    // 180_500ms truncates to 180s
    expect(calculateDurationConfidence(180_500, 180)).toBe(100);
  });

  it("returns high confidence for close durations", () => {
    // 3min Spotify, 3min05s YouTube — 5s diff, 10% of 185 = 18.5s tolerance
    const confidence = calculateDurationConfidence(180_000, 185);
    expect(confidence).toBeGreaterThan(70);
  });

  it("returns 0 for wildly different durations", () => {
    // 3min vs 30min
    const confidence = calculateDurationConfidence(180_000, 1800);
    expect(confidence).toBe(0);
  });

  it("returns 100 when both durations are zero", () => {
    expect(calculateDurationConfidence(0, 0)).toBe(100);
  });

  it("returns 0 when one duration is zero and other is not", () => {
    expect(calculateDurationConfidence(0, 180)).toBe(0);
  });

  it("returns 0 when spotify is zero and youtube is nonzero", () => {
    expect(calculateDurationConfidence(0, 10)).toBe(0);
  });

  it("decreases linearly as difference grows within tolerance", () => {
    const exact = calculateDurationConfidence(200_000, 200);
    const close = calculateDurationConfidence(200_000, 205);
    const far = calculateDurationConfidence(200_000, 210);

    expect(exact).toBeGreaterThan(close);
    expect(close).toBeGreaterThan(far);
  });

  it("clamps result between 0 and 100", () => {
    const result = calculateDurationConfidence(100_000, 500);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

describe("isYouTubeContentExplicit", () => {
  function meta(overrides: Partial<VideoMetadata> = {}): VideoMetadata {
    return { title: "Song Title", channel: "Artist", ...overrides };
  }

  it("returns false for normal title without explicit keyword", () => {
    expect(isYouTubeContentExplicit(meta())).toBe(false);
  });

  it("returns true when title contains 'explicit'", () => {
    expect(isYouTubeContentExplicit(meta({ title: "Song (Explicit)" }))).toBe(
      true,
    );
  });

  it("is case-insensitive for explicit keyword", () => {
    expect(
      isYouTubeContentExplicit(meta({ title: "Song EXPLICIT Version" })),
    ).toBe(true);
  });

  it("returns false when madeForKids is true even with explicit in title", () => {
    expect(
      isYouTubeContentExplicit(
        meta({ title: "Song (Explicit)", madeForKids: true }),
      ),
    ).toBe(false);
  });

  it("returns false when selfDeclaredMadeForKids is true", () => {
    expect(
      isYouTubeContentExplicit(
        meta({ title: "Song (Explicit)", selfDeclaredMadeForKids: true }),
      ),
    ).toBe(false);
  });
});

describe("isYouTubeContentClean", () => {
  function meta(overrides: Partial<VideoMetadata> = {}): VideoMetadata {
    return { title: "Song Title", channel: "Artist", ...overrides };
  }

  it("returns false for normal title without clean keywords", () => {
    expect(isYouTubeContentClean(meta())).toBe(false);
  });

  it("returns true when title contains 'clean'", () => {
    expect(isYouTubeContentClean(meta({ title: "Song (Clean)" }))).toBe(true);
  });

  it("returns true when title contains 'censored'", () => {
    expect(
      isYouTubeContentClean(meta({ title: "Song (Censored Version)" })),
    ).toBe(true);
  });

  it("returns true when title contains 'radio edit'", () => {
    expect(isYouTubeContentClean(meta({ title: "Song - Radio Edit" }))).toBe(
      true,
    );
  });

  it("returns true when title contains 'tv edit'", () => {
    expect(isYouTubeContentClean(meta({ title: "Song TV Edit" }))).toBe(true);
  });

  it("returns true when channel contains 'clean'", () => {
    expect(isYouTubeContentClean(meta({ channel: "CleanMusicChannel" }))).toBe(
      true,
    );
  });

  it("returns true when channel contains 'radio'", () => {
    expect(isYouTubeContentClean(meta({ channel: "Hot Radio FM" }))).toBe(true);
  });

  it("returns true when channel contains 'tv'", () => {
    expect(isYouTubeContentClean(meta({ channel: "Music TV" }))).toBe(true);
  });

  it("returns true when madeForKids is true", () => {
    expect(isYouTubeContentClean(meta({ madeForKids: true }))).toBe(true);
  });

  it("returns true when selfDeclaredMadeForKids is true", () => {
    expect(isYouTubeContentClean(meta({ selfDeclaredMadeForKids: true }))).toBe(
      true,
    );
  });

  it("is case-insensitive for channel keywords", () => {
    expect(isYouTubeContentClean(meta({ channel: "RADIO Station" }))).toBe(
      true,
    );
  });
});

describe("YouTubeService.search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetRedisConnection.mockReturnValue({
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue("OK"),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts videos.list payload without snippet when requesting contentDetails,status", async () => {
    const originalFetch = global.fetch;

    const searchPayload = {
      items: [
        {
          id: { videoId: "video-1" },
          snippet: {
            title: "Song Title",
            channelTitle: "Channel Name",
            thumbnails: {
              default: { url: "https://img.youtube.com/default.jpg" },
            },
          },
        },
      ],
    };

    const videosPayload = {
      items: [
        {
          id: "video-1",
          contentDetails: { duration: "PT3M5S" },
          statistics: { viewCount: "184581" },
          status: {
            madeForKids: false,
            selfDeclaredMadeForKids: false,
          },
        },
      ],
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(searchPayload), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(videosPayload), { status: 200 }),
      );

    global.fetch = fetchMock;

    try {
      const service = new YouTubeService({} as Session);
      const result = await service.search({
        trackName: "Song Title",
        artistName: "Artist Name",
        albumName: "Album Name",
        durationMs: 180_000,
      });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0]).toMatchObject({
        videoId: "video-1",
        title: "Song Title",
        channel: "Channel Name",
        duration: "PT3M5S",
        viewCount: 184581,
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
