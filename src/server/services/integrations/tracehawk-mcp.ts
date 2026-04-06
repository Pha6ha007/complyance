/**
 * TraceHawk MCP Trust Score integration.
 *
 * TraceHawk publishes a public, no-auth API that returns trust scores
 * for known MCP (Model Context Protocol) servers. We pull these scores
 * to enrich Complyance's vendor risk assessment — if a vendor relies on
 * MCP servers with low trust scores, that's a supply-chain risk factor
 * that pure-rule-based assessment would miss.
 *
 * Public endpoint: GET {TRACEHAWK_API_URL}/api/mcp/trust-scores?server={name}
 * Returns: { server: string, trustScore: number }  (0-100)
 *
 * This service is intentionally graceful: if TRACEHAWK_API_URL is not set,
 * if a request times out, or if TraceHawk is unreachable, we return zero
 * scores rather than throwing. The caller decides whether to apply the
 * enrichment or fall back to the pure rule-based assessment.
 */

const REQUEST_TIMEOUT_MS = 5_000;

export interface MCPServerScore {
  /** Server name as queried (e.g. 'filesystem', 'github', 'slack'). */
  name: string;
  /** Trust score 0-100. Higher is better. 0 means unknown / fetch failed. */
  trustScore: number;
}

export interface MCPEnrichmentResult {
  /**
   * Average trust score across the fetched MCP servers. 0 if no servers
   * were fetched, if TRACEHAWK_API_URL is unset, or if every fetch failed.
   */
  avgTrustScore: number;
  /**
   * Per-server breakdown. Servers that failed to fetch get a score of 0
   * so the caller can spot which ones are missing data.
   */
  servers: MCPServerScore[];
  /**
   * True when we deliberately did not contact TraceHawk (env var unset).
   * Lets callers distinguish "not configured" from "fetched but all zero".
   */
  skipped: boolean;
}

/**
 * Fetch MCP trust scores for the given server names from TraceHawk.
 *
 * Per-server timeout: 5 seconds. Network errors / non-200 responses /
 * unexpected payload shapes are caught and treated as score=0 for that
 * server. The function never throws.
 *
 * @param serverNames Distinct MCP server names to query
 */
export async function enrichVendorWithMCPTrust(
  serverNames: string[]
): Promise<MCPEnrichmentResult> {
  const baseUrl = process.env.TRACEHAWK_API_URL;
  if (!baseUrl) {
    return { avgTrustScore: 0, servers: [], skipped: true };
  }

  // Defensive: dedupe + drop empties
  const unique = Array.from(
    new Set(serverNames.map((s) => s.trim()).filter(Boolean))
  );

  if (unique.length === 0) {
    return { avgTrustScore: 0, servers: [], skipped: false };
  }

  const cleanBase = baseUrl.replace(/\/$/, '');

  // Fetch every server in parallel — each with its own AbortController so
  // one slow server doesn't block the others.
  const results = await Promise.all(
    unique.map((server) => fetchOne(cleanBase, server))
  );

  // Compute average across non-zero scores. Zero-score entries are
  // included in the count so the caller sees the full picture, but the
  // average reflects only successfully-fetched servers — otherwise a
  // single missing server would tank the average.
  const successful = results.filter((r) => r.trustScore > 0);
  const avgTrustScore =
    successful.length > 0
      ? Math.round(
          successful.reduce((sum, r) => sum + r.trustScore, 0) / successful.length
        )
      : 0;

  return {
    avgTrustScore,
    servers: results,
    skipped: false,
  };
}

/**
 * Fetch one MCP server's trust score. Always resolves; never throws.
 * Failures (timeout, network, bad payload, 4xx/5xx) yield score=0.
 */
async function fetchOne(baseUrl: string, server: string): Promise<MCPServerScore> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${baseUrl}/api/mcp/trust-scores?server=${encodeURIComponent(server)}`;
    const res = await fetch(url, {
      method: 'GET',
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return { name: server, trustScore: 0 };
    }

    const data: unknown = await res.json();

    // Accept either { trustScore: N } or { server, trustScore: N }
    if (
      typeof data === 'object' &&
      data !== null &&
      'trustScore' in data &&
      typeof (data as { trustScore: unknown }).trustScore === 'number'
    ) {
      const score = (data as { trustScore: number }).trustScore;
      // Clamp to 0-100 to defend against API inconsistency
      const clamped = Math.max(0, Math.min(100, Math.round(score)));
      return { name: server, trustScore: clamped };
    }

    return { name: server, trustScore: 0 };
  } catch {
    // AbortError, network failure, JSON parse error — all treated the same
    return { name: server, trustScore: 0 };
  } finally {
    clearTimeout(timer);
  }
}
