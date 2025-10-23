/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "~/server/auth/config";

interface CreateContextOptions {
  req: NextApiRequest;
  res: NextApiResponse;
}

/**
 * 1. the way TypeScript describes this function. The shape isn't important as long as:
 *    - the function determines the `req`'s session
 *    - you keep the TsSession type
 *
 * 2. your `getServerSession` call in it
 * 3. your `req` is a `NextRequest`
 *
 * @see https://trpc.io/docs/server/context#server-context
 */
export async function createContext(opts: CreateContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authConfig);

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC for a NextJS app
 *
 * @see https://trpc.io/docs/v10/nextjs
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape } = opts;
    const { code } = shape;

    const isAppErrorCode =
      String(code).startsWith("INTERNAL_SERVER_ERROR") ||
      String(code).startsWith("BAD_REQUEST") ||
      String(code).startsWith("UNAUTHORIZED") ||
      String(code).startsWith("FORBIDDEN") ||
      String(code).startsWith("NOT_FOUND") ||
      String(code).startsWith("TOO_MANY_REQUESTS") ||
      String(code).startsWith("METHOD_NOT_SUPPORTED") ||
      String(code).startsWith("PAYLOAD_TOO_LARGE") ||
      String(code).startsWith("UNPROCESSABLE_CONTENT");

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          opts.error.code === "BAD_REQUEST" &&
          opts.error.cause instanceof ZodError
            ? opts.error.cause.flatten()
            : null,
      },
      ...(isAppErrorCode && {
        message:
          "An unexpected error occurred, please try again later. If this issue persists, please contact support.",
      }),
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 * @see https://trpc.io/docs/v10/server/router-and-procedure-helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { session } = ctx;

  if (!session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: session,
    },
  });
});
