/**
 * Legislation data normalization — shared between seed and cron sync.
 * Handles 3 different JSON shapes from ai-legislation-tracker repo.
 */

export interface NormalizedLegislation {
  externalId: string;
  jurisdiction: string;
  region: string;
  title: string;
  status: string;
  effectiveDate: Date | null;
  summary: string;
  keyProvisions: string[];
  sourceUrl: string;
  tags: string[];
  lastVerified: Date;
  impactLevel: string;
}

const JURISDICTION_MAP: Record<string, { code: string; region: string }> = {
  'European Union': { code: 'EU', region: 'EU' },
  'United Kingdom': { code: 'UK', region: 'EU' },
  'China': { code: 'CN', region: 'APAC' },
  'Canada': { code: 'CA', region: 'US' },
  'Brazil': { code: 'BR', region: 'OTHER' },
  'Singapore': { code: 'SG', region: 'APAC' },
  'Japan': { code: 'JP', region: 'APAC' },
  'South Korea': { code: 'KR', region: 'APAC' },
  'Australia': { code: 'AU', region: 'APAC' },
  'India': { code: 'IN', region: 'APAC' },
  'Colorado': { code: 'US-CO', region: 'US' },
  'Illinois': { code: 'US-IL', region: 'US' },
  'California': { code: 'US-CA', region: 'US' },
  'Texas': { code: 'US-TX', region: 'US' },
  'New York': { code: 'US-NY', region: 'US' },
  'Virginia': { code: 'US-VA', region: 'US' },
  'Connecticut': { code: 'US-CT', region: 'US' },
  'Massachusetts': { code: 'US-MA', region: 'US' },
  'Washington': { code: 'US-WA', region: 'US' },
  'Maryland': { code: 'US-MD', region: 'US' },
};

function resolveJurisdiction(entry: Record<string, unknown>): { code: string; region: string } {
  const jurisdiction = (entry.jurisdiction || entry.state || '') as string;
  const mapped = JURISDICTION_MAP[jurisdiction];
  if (mapped) return mapped;
  if (entry.issuing_body) return { code: 'US-FED', region: 'US' };
  return { code: 'UNKNOWN', region: 'OTHER' };
}

function parseDate(dateStr: unknown): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function resolveImpact(entry: Record<string, unknown>): string {
  const tags = (entry.tags || []) as string[];
  if (tags.includes('comprehensive') || tags.includes('binding')) return 'HIGH';
  if (tags.includes('voluntary') || tags.includes('principles')) return 'LOW';
  return 'MEDIUM';
}

export function normalizeInternational(entry: Record<string, unknown>): NormalizedLegislation {
  const { code, region } = resolveJurisdiction(entry);
  return {
    externalId: entry.id as string,
    jurisdiction: code,
    region,
    title: (entry.name || entry.title || '') as string,
    status: (entry.status || 'proposed') as string,
    effectiveDate: parseDate(entry.date_effective || entry.effective_date),
    summary: (entry.summary || '') as string,
    keyProvisions: (entry.key_provisions || []) as string[],
    sourceUrl: (entry.source_url || '') as string,
    tags: (entry.tags || []) as string[],
    lastVerified: parseDate(entry.last_verified) || new Date(),
    impactLevel: resolveImpact(entry),
  };
}

export function normalizeUsState(entry: Record<string, unknown>): NormalizedLegislation {
  const { code, region } = resolveJurisdiction(entry);
  const billNumber = entry.bill_number ? ` (${entry.bill_number})` : '';
  return {
    externalId: entry.id as string,
    jurisdiction: code,
    region,
    title: `${entry.title || ''}${billNumber}`,
    status: (entry.status || 'proposed') as string,
    effectiveDate: parseDate(entry.effective_date),
    summary: (entry.summary || '') as string,
    keyProvisions: (entry.key_provisions || []) as string[],
    sourceUrl: (entry.source_url || '') as string,
    tags: (entry.tags || []) as string[],
    lastVerified: parseDate(entry.last_verified) || new Date(),
    impactLevel: resolveImpact(entry),
  };
}

export function normalizeUsFederal(entry: Record<string, unknown>): NormalizedLegislation {
  const { code, region } = resolveJurisdiction(entry);
  const type = entry.type ? ` [${entry.type}]` : '';
  return {
    externalId: entry.id as string,
    jurisdiction: code,
    region,
    title: `${entry.title || ''}${type}`,
    status: (entry.status || 'proposed') as string,
    effectiveDate: parseDate(entry.date_issued || entry.effective_date),
    summary: (entry.summary || '') as string,
    keyProvisions: (entry.key_provisions || []) as string[],
    sourceUrl: (entry.source_url || '') as string,
    tags: (entry.tags || []) as string[],
    lastVerified: parseDate(entry.last_verified) || new Date(),
    impactLevel: resolveImpact(entry),
  };
}
