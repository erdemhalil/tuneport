import { spotifyRouter } from "~/server/api/routers/spotify";
import { youtubeRouter } from "~/server/api/routers/youtube";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  spotify: spotifyRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;
