import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { YouTubeService } from "~/server/services/youtubeService";
import {
  enqueueDownloads,
  getDownloadStatus,
  cleanupDownloads,
  downloadTrackInputSchema,
} from "~/server/services/downloadService";

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
      return youtubeService.resolveVideoById(input.videoId);
    }),

  downloadTracks: protectedProcedure
    .input(
      z.object({
        tracks: z.array(downloadTrackInputSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return enqueueDownloads(input.tracks, ctx.session.user.id);
    }),

  getDownloadStatus: protectedProcedure
    .input(
      z.object({
        jobIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getDownloadStatus(input.jobIds, ctx.session.user.id);
    }),

  cleanupDownloads: protectedProcedure
    .input(
      z.object({
        downloadIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return cleanupDownloads(input.downloadIds, ctx.session.user.id);
    }),
});
