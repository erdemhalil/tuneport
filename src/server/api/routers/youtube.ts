import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { YouTubeService } from "~/server/services/youtubeService";

export const youtubeRouter = createTRPCRouter({
  searchYouTube: protectedProcedure
    .input(
      z.object({
        trackName: z.string(),
        artistName: z.string(),
        albumName: z.string().optional(),
        durationMs: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const youtubeService = new YouTubeService(ctx.session);
      return youtubeService.search(input);
    }),

  searchYouTubeByQuery: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        maxResults: z.number().min(1).max(15).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const youtubeService = new YouTubeService(ctx.session);
      return youtubeService.searchByQuery(input.query, input.maxResults ?? 8);
    }),

  resolveYouTubeVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const youtubeService = new YouTubeService(ctx.session);
      const match = await youtubeService.resolveVideoById(input.videoId);
      return { match };
    }),

  downloadTracks: protectedProcedure
    .input(
      z.object({
        tracks: z.array(
          z.object({
            videoId: z.string(),
            trackName: z.string(),
            artistName: z.string(),
            allArtists: z.array(z.string()).optional(),
            artwork: z.string().optional(),
            useArtistInFilename: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const youtubeService = new YouTubeService(ctx.session);
      return youtubeService.downloadTracks(input.tracks);
    }),

  getDownloadStatus: protectedProcedure
    .input(
      z.object({
        jobIds: z.array(z.string()),
      }),
    )
    .query(async ({ input }) => {
      return YouTubeService.getDownloadStatus(input.jobIds);
    }),

  cleanupDownloads: protectedProcedure
    .input(
      z.object({
        downloadIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return YouTubeService.cleanupDownloads(input.downloadIds);
    }),
});
