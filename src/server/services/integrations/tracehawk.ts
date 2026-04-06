import type { PrismaClient, RiskLevel } from '@prisma/client';

/**
 * TraceHawk integration helper.
 *
 * Complyance pushes compliance status into TraceHawk so runtime traces can be
 * displayed alongside the agent's current risk level / compliance score.
 *
 * The integration is intentionally fire-and-forget for background updates
 * (classification, gap status changes), and synchronous-with-timeout for
 * explicit user actions (link/unlink), so the UI can surface push errors.
 */

export interface TraceHawkPushResult {
  pushed: boolean;
  reason?: 'no-link' | 'no-classification' | 'no-api-url' | 'http-error' | 'network-error';
  status?: number;
  error?: string;
}

interface SystemForPush {
  id: string;
  riskLevel: RiskLevel | null;
  complianceScore: number | null;
  annexIIICategory: string | null;
  processesPersonalData: boolean;
  tracehawkAgentId: string | null;
  tracehawkOrgApiKey: string | null;
}

function deriveComplianceStatus(score: number | null): 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' {
  if (score == null) return 'PENDING';
  return score >= 80 ? 'COMPLIANT' : 'NON_COMPLIANT';
}

/**
 * Push the given system's current compliance state to TraceHawk.
 *
 * Synchronous (awaitable). Apply your own timeout via AbortSignal at the
 * call site if you want to bound the wait.
 */
export async function pushComplianceToTraceHawk(
  system: SystemForPush,
  options: { signal?: AbortSignal } = {}
): Promise<TraceHawkPushResult> {
  if (!system.tracehawkAgentId || !system.tracehawkOrgApiKey) {
    return { pushed: false, reason: 'no-link' };
  }

  if (system.riskLevel == null) {
    return { pushed: false, reason: 'no-classification' };
  }

  const baseUrl = process.env.TRACEHAWK_API_URL;
  if (!baseUrl) {
    return { pushed: false, reason: 'no-api-url' };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/platform/compliance`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${system.tracehawkOrgApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: system.tracehawkAgentId,
        riskLevel: system.riskLevel,
        complianceStatus: deriveComplianceStatus(system.complianceScore),
        complianceScore: system.complianceScore,
        annexIIICategory: system.annexIIICategory,
        complyanceSystemId: system.id,
        processesPersonalData: system.processesPersonalData,
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      return { pushed: false, reason: 'http-error', status: res.status };
    }

    return { pushed: true, status: res.status };
  } catch (err) {
    return {
      pushed: false,
      reason: 'network-error',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Load the system from the DB by id, push to TraceHawk, and (on success)
 * update lastTracehawkSync. Convenient for fire-and-forget callers in
 * tRPC mutations.
 *
 * Errors are swallowed and returned in the result — never thrown.
 */
export async function syncSystemToTraceHawk(
  prisma: PrismaClient,
  systemId: string,
  options: { signal?: AbortSignal } = {}
): Promise<TraceHawkPushResult> {
  const system = await prisma.aISystem.findUnique({
    where: { id: systemId },
    select: {
      id: true,
      riskLevel: true,
      complianceScore: true,
      annexIIICategory: true,
      processesPersonalData: true,
      tracehawkAgentId: true,
      tracehawkOrgApiKey: true,
    },
  });

  if (!system) {
    return { pushed: false, reason: 'no-link' };
  }

  const result = await pushComplianceToTraceHawk(system, options);

  if (result.pushed) {
    try {
      await prisma.aISystem.update({
        where: { id: systemId },
        data: { lastTracehawkSync: new Date() },
      });
    } catch (err) {
      // Non-fatal — sync succeeded, only the bookkeeping write failed.
      console.error('[tracehawk] failed to update lastTracehawkSync', err);
    }
  }

  return result;
}

/**
 * Fire-and-forget variant. Used from hot paths (classify, gap update) where
 * we don't want to delay the user-facing response on a slow external call.
 *
 * Errors are logged but never propagated.
 */
export function syncSystemToTraceHawkInBackground(
  prisma: PrismaClient,
  systemId: string
): void {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 8000);

  syncSystemToTraceHawk(prisma, systemId, { signal: ac.signal })
    .catch((err) => {
      console.error('[tracehawk] background sync failed', err);
    })
    .finally(() => clearTimeout(timeout));
}
