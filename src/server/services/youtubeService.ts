import { TRPCError } from "@trpc/server";
import { z, type ZodType } from "zod";
import { env } from "~/env";
import type { Session } from "next-auth";
import { getRedisConnection } from "~/server/lib/redis";
import { parseIsoDuration } from "~/utils/duration";

const CACHE_TTL_SECONDS = 1800;

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  viewCount?: number | null;
  confidence: number;
  explicit: boolean;
  clean: boolean;
}

interface YouTubeSearchInput {
  trackName: string;
  artistName: string;
  albumName?: string;
  durationMs: number;
}

export interface VideoMetadata {
  title: string;
  channel: string;
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean;
}

interface YouTubeResultInput {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  viewCount?: number | null;
  confidence: number;
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean;
}

const youTubeSearchResultSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
  duration: z.string(),
  thumbnail: z.string(),
  viewCount: z
    .number()
    .nullable()
    .nullish()
    .transform((value) => value ?? null),
  confidence: z.number(),
  explicit: z.boolean(),
  clean: z.boolean(),
});

const cachedSearchMatchesSchema = z.object({
  matches: z.array(youTubeSearchResultSchema),
});

const cachedResolvedVideoSchema = z.object({
  match: youTubeSearchResultSchema.nullable(),
});

export function calculateDurationConfidence(
  spotifyDurationMs: number,
  youtubeDurationSec: number,
): number {
  const spotifyDurationSec = Math.floor(spotifyDurationMs / 1000);
  const diff = Math.abs(spotifyDurationSec - youtubeDurationSec);
  const maxDiff = Math.max(spotifyDurationSec, youtubeDurationSec) * 0.1; // 10% tolerance

  if (maxDiff === 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, 100 - (diff / maxDiff) * 100));
}

export function isYouTubeContentExplicit(meta: VideoMetadata): boolean {
  if (meta.madeForKids === true || meta.selfDeclaredMadeForKids === true) {
    return false;
  }

  const lowerTitle = meta.title.toLowerCase();
  return lowerTitle.includes("explicit");
}

export function isYouTubeContentClean(meta: VideoMetadata): boolean {
  if (meta.madeForKids === true || meta.selfDeclaredMadeForKids === true) {
    return true;
  }

  const cleanKeywords = ["clean", "censored", "radio edit", "tv edit"];
  const lowerTitle = meta.title.toLowerCase();
  const lowerChannel = meta.channel.toLowerCase();

  if (cleanKeywords.some((keyword) => lowerTitle.includes(keyword))) {
    return true;
  }

  if (
    lowerChannel.includes("clean") ||
    lowerChannel.includes("radio") ||
    lowerChannel.includes("tv")
  ) {
    return true;
  }

  return false;
}

function parseYouTubeViewCount(viewCount: string | undefined): number | null {
  if (!viewCount) {
    return null;
  }

  const parsed = Number(viewCount);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function buildYouTubeSearchResult(
  input: YouTubeResultInput,
): YouTubeSearchResult {
  const metadata: VideoMetadata = {
    title: input.title,
    channel: input.channel,
    madeForKids: input.madeForKids,
    selfDeclaredMadeForKids: input.selfDeclaredMadeForKids,
  };

  return {
    videoId: input.videoId,
    title: input.title,
    channel: input.channel,
    duration: input.duration,
    thumbnail: input.thumbnail,
    viewCount: input.viewCount ?? null,
    confidence: input.confidence,
    explicit: isYouTubeContentExplicit(metadata),
    clean: isYouTubeContentClean(metadata),
  };
}

/** Zod schema for YouTube Data API v3 search.list response */
const youTubeSearchResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.object({ videoId: z.string() }),
      snippet: z.object({
        title: z.string(),
        channelTitle: z.string(),
        thumbnails: z.object({
          medium: z.object({ url: z.string() }).optional(),
          default: z.object({ url: z.string() }),
        }),
      }),
    }),
  ),
});

/** Zod schema for a videos.list item when requesting only contentDetails and status */
const youTubeVideoSummaryItemSchema = z.object({
  id: z.string(),
  contentDetails: z.object({ duration: z.string() }),
  status: z.object({
    madeForKids: z.boolean().optional(),
    selfDeclaredMadeForKids: z.boolean().optional(),
  }),
  statistics: z
    .object({
      viewCount: z.string().optional(),
    })
    .optional(),
});

/** Zod schema for a videos.list item when requesting snippet, contentDetails, and status */
const youTubeVideoFullItemSchema = youTubeVideoSummaryItemSchema.extend({
  snippet: z.object({
    title: z.string(),
    channelTitle: z.string(),
    thumbnails: z.object({
      medium: z.object({ url: z.string() }).optional(),
      default: z.object({ url: z.string() }),
    }),
  }),
});

/** Zod schema for YouTube Data API v3 videos.list response without snippet */
const youTubeVideoSummaryResponseSchema = z.object({
  items: z.array(youTubeVideoSummaryItemSchema),
});

/** Zod schema for YouTube Data API v3 videos.list response with snippet */
const youTubeVideoFullResponseSchema = z.object({
  items: z.array(youTubeVideoFullItemSchema),
});

type YouTubeVideoSummaryResponse = z.infer<
  typeof youTubeVideoSummaryResponseSchema
>;
type YouTubeVideoFullResponse = z.infer<typeof youTubeVideoFullResponseSchema>;

export class YouTubeService {
  private session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  private async fetchYouTubeApi<T>(
    url: string,
    label: string,
    schema: ZodType<T>,
  ): Promise<T> {
    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "YouTube API key is not configured",
      });
    }

    let response: Response;
    try {
      response = await fetch(`${url}&key=${apiKey}`);
    } catch (networkError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `YouTube ${label} API network error: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
        cause: networkError,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube ${label} API error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      if (response.status === 403) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "YouTube API access denied. Please check your API key and ensure YouTube Data API v3 is enabled.",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `YouTube ${label} API error: ${response.status} - ${errorText}`,
      });
    }

    const json: unknown = await response.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(
        `YouTube ${label} API response validation failed:`,
        parsed.error.issues,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `YouTube ${label} API returned unexpected response shape`,
      });
    }
    return parsed.data;
  }

  /**
   * Best-effort cache wrapper.
   *
   * Reads are validated with `schema`. If Redis is unavailable or cached data
   * fails validation, the method silently falls back to `fetcher()`.
   */
  private async cachedFetch<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    schema: ZodType<T>,
  ): Promise<T> {
    try {
      const cachedResult = await getRedisConnection().get(cacheKey);
      if (cachedResult) {
        const parsed: unknown = JSON.parse(cachedResult);
        const validated = schema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
        console.warn("Cached data failed validation, refetching:", cacheKey);
      }
    } catch (error) {
      console.warn("Redis cache read error:", error);
    }

    const result = await fetcher();

    try {
      await getRedisConnection().setex(
        cacheKey,
        CACHE_TTL_SECONDS,
        JSON.stringify(result),
      );
    } catch (error) {
      console.warn("Redis cache write error:", error);
    }

    return result;
  }

  async search(
    input: YouTubeSearchInput,
  ): Promise<{ matches: YouTubeSearchResult[] }> {
    const searchQuery = `${input.artistName} ${input.trackName} autogenerated`;
    const cacheKey = `youtube:search:${searchQuery}:${input.durationMs}`;

    return this.cachedFetch(
      cacheKey,
      async () => {
        const searchData = await this.fetchYouTubeApi(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5`,
          "Search",
          youTubeSearchResponseSchema,
        );

        if (searchData.items.length === 0) {
          return { matches: [] };
        }

        const videoIds = searchData.items
          .map((item) => item.id.videoId)
          .join(",");
        const detailsData = await this.fetchYouTubeApi<YouTubeVideoSummaryResponse>(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,statistics&id=${videoIds}`,
          "Videos",
          youTubeVideoSummaryResponseSchema,
        );

        const detailsById = new Map(
          detailsData.items.map((item) => [item.id, item]),
        );

        const matches: YouTubeSearchResult[] = searchData.items
          .map((item) => {
            const details = detailsById.get(item.id.videoId);
            const youtubeDurationSec = details
              ? parseIsoDuration(details.contentDetails.duration)
              : 0;
            const confidence = calculateDurationConfidence(
              input.durationMs,
              youtubeDurationSec,
            );
            return buildYouTubeSearchResult({
              videoId: item.id.videoId,
              title: item.snippet.title,
              channel: item.snippet.channelTitle,
              duration: details?.contentDetails.duration ?? "PT0S",
              thumbnail: item.snippet.thumbnails.default.url,
              viewCount: parseYouTubeViewCount(details?.statistics?.viewCount),
              confidence,
              madeForKids: details?.status.madeForKids,
              selfDeclaredMadeForKids: details?.status.selfDeclaredMadeForKids,
            });
          })
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5);

        return { matches };
      },
      cachedSearchMatchesSchema,
    );
  }

  async searchByQuery(
    query: string,
    maxResults = 8,
  ): Promise<{ matches: YouTubeSearchResult[] }> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { matches: [] };
    }

    const cacheKey = `youtube:query:${trimmedQuery}:${maxResults}`;

    return this.cachedFetch(
      cacheKey,
      async () => {
        const searchData = await this.fetchYouTubeApi(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(trimmedQuery)}&type=video&maxResults=${maxResults}`,
          "Search",
          youTubeSearchResponseSchema,
        );

        if (searchData.items.length === 0) {
          return { matches: [] };
        }

        const videoIds = searchData.items.map((item) => item.id.videoId);
        const detailsData = await this.fetchYouTubeApi<YouTubeVideoSummaryResponse>(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,statistics&id=${videoIds.join(",")}`,
          "Videos",
          youTubeVideoSummaryResponseSchema,
        );

        const detailsById = new Map(
          detailsData.items.map((item) => [item.id, item]),
        );

        const matches: YouTubeSearchResult[] = searchData.items.map((item) => {
          const details = detailsById.get(item.id.videoId);
          return buildYouTubeSearchResult({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            duration: details?.contentDetails.duration ?? "PT0S",
            thumbnail:
              item.snippet.thumbnails.medium?.url ??
              item.snippet.thumbnails.default.url,
            viewCount: parseYouTubeViewCount(details?.statistics?.viewCount),
            confidence: 80,
            madeForKids: details?.status.madeForKids,
            selfDeclaredMadeForKids: details?.status.selfDeclaredMadeForKids,
          });
        });

        return { matches };
      },
      cachedSearchMatchesSchema,
    );
  }

  /**
   * Resolves a YouTube video by its ID, returning full video details.
   *
   * @returns The video details wrapped in `{ match }`, or `{ match: null }` if not found.
   * @throws {TRPCError} If the YouTube API request fails (network error, auth error, etc.).
   */
  async resolveVideoById(
    videoId: string,
  ): Promise<{ match: YouTubeSearchResult | null }> {
    const trimmedId = videoId.trim();
    if (!trimmedId) {
      return { match: null };
    }

    const cacheKey = `youtube:video:${trimmedId}`;

    return this.cachedFetch(
      cacheKey,
      async () => {
        const detailsData = await this.fetchYouTubeApi<YouTubeVideoFullResponse>(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status,statistics&id=${encodeURIComponent(trimmedId)}`,
          "Videos",
          youTubeVideoFullResponseSchema,
        );

        const item = detailsData.items?.[0];
        if (!item) {
          return { match: null };
        }

        const match = buildYouTubeSearchResult({
          videoId: item.id,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          duration: item.contentDetails.duration ?? "PT0S",
          thumbnail:
            item.snippet.thumbnails.medium?.url ??
            item.snippet.thumbnails.default.url,
          viewCount: parseYouTubeViewCount(item.statistics?.viewCount),
          confidence: 100,
          madeForKids: item.status.madeForKids,
          selfDeclaredMadeForKids: item.status.selfDeclaredMadeForKids,
        });

        return {
          match,
        };
      },
      cachedResolvedVideoSchema,
    );
  }
}
