import 'server-only';

import { httpBatchLink } from '@trpc/client';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import { NextRequest } from 'next/server';

/**
 * Server-side tRPC caller
 * Use this in server components and server actions
 */
export const createCaller = async (req?: NextRequest) => {
  const context = await createTRPCContext({
    req: req || new NextRequest(new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')),
  });

  return appRouter.createCaller(context);
};
