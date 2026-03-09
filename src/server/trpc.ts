import { initTRPC, TRPCError } from '@trpc/server';
import { type NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@/../auth';
import { prisma } from './db/client';
import type { Session } from 'next-auth';

// Sentry (conditional import)
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  // Sentry not installed
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 */

interface CreateContextOptions {
  session: Session | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export type Context = ReturnType<typeof createInnerTRPCContext>;

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 */
export const createTRPCContext = async (opts: { req: NextRequest }): Promise<Context> => {
  // Get the session from NextAuth
  // Call auth() as a function, not as middleware
  const session = (await auth()) as Session | null;

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Capture error in Sentry if it's a server error
    if (
      Sentry &&
      error.code === 'INTERNAL_SERVER_ERROR' &&
      error.cause instanceof Error
    ) {
      Sentry.captureException(error.cause, {
        contexts: {
          trpc: {
            code: error.code,
            path: (shape as any).path,
          },
        },
      });
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE HELPERS
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 */
export const router = t.router;

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Get user with organization
  const user = await prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user },
      user,
      organization: user.organization,
    },
  });
});

/**
 * Admin procedure
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({
    ctx,
  });
});
