import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { SpotifyService } from "~/server/services/spotifyService";

export const spotifyRouter = createTRPCRouter({
  likedSongs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const spotifyService = new SpotifyService(ctx.session);
      return spotifyService.getLikedSongs(input.limit, input.offset);
    }),

  playlists: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const spotifyService = new SpotifyService(ctx.session);
      return spotifyService.getPlaylists(input.limit, input.offset);
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
      const spotifyService = new SpotifyService(ctx.session);
      return spotifyService.getPlaylistTracks(
        input.id,
        input.limit,
        input.offset,
      );
    }),

  collections: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const spotifyService = new SpotifyService(ctx.session);
      return spotifyService.getCollections(input.limit, input.offset);
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
      const spotifyService = new SpotifyService(ctx.session);
      return spotifyService.getCollectionTracks(
        input.collectionId,
        input.limit,
        input.offset,
      );
    }),
});
