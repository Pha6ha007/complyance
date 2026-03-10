import { router } from '../trpc';
import { systemRouter } from './system';
import { classificationRouter } from './classification';
import { documentRouter } from './document';
import { vendorRouter } from './vendor';
import { badgeRouter } from './badge';
import { evidenceRouter } from './evidence';
import { intelligenceRouter } from './intelligence';
import { referralRouter } from './referral';

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/routers should be manually added here.
 */
export const appRouter = router({
  system: systemRouter,
  classification: classificationRouter,
  document: documentRouter,
  vendor: vendorRouter,
  badge: badgeRouter,
  evidence: evidenceRouter,
  intelligence: intelligenceRouter,
  referral: referralRouter,
  // TODO: Add other routers as they are created:
  // incident: incidentRouter,
  // team: teamRouter,
  // billing: billingRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
