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
