import { router } from '../trpc';
import { systemRouter } from './system';
import { classificationRouter } from './classification';
import { documentRouter } from './document';

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/routers should be manually added here.
 */
export const appRouter = router({
  system: systemRouter,
  classification: classificationRouter,
  document: documentRouter,
  // TODO: Add other routers as they are created:
  // vendor: vendorRouter,
  // evidence: evidenceRouter,
  // incident: incidentRouter,
  // intelligence: intelligenceRouter,
  // team: teamRouter,
  // billing: billingRouter,
  // referral: referralRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
