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

// @see https://trpc.io/docs/server/context#server-context
export async function createContext(opts: CreateContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authConfig);

  return {
    session,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

// @see https://trpc.io/docs/v10/nextjs
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape } = opts;

    const isServerError = opts.error.code === "INTERNAL_SERVER_ERROR";

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
      ...(isServerError &&
        !(opts.error instanceof TRPCError) && {
          message:
            "An unexpected error occurred, please try again later. If this issue persists, please contact support.",
        }),
    };
  },
});

export const createTRPCRouter = t.router;
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
