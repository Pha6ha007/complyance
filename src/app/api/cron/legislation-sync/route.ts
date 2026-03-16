import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import {
  normalizeInternational,
  normalizeUsState,
  normalizeUsFederal,
  type NormalizedLegislation,
} from '@/lib/legislation-normalizer';

const SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/international_frameworks.json',
    normalize: normalizeInternational,
  },
  {
    url: 'https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/us_state_bills.json',
    normalize: normalizeUsState,
  },
  {
    url: 'https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/us_federal_actions.json',
    normalize: normalizeUsFederal,
  },
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let totalUpdated = 0;
  const errors: string[] = [];

  for (const source of SOURCES) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } });
      if (!res.ok) {
        errors.push(`${source.url}: HTTP ${res.status}`);
        continue;
      }

      const data: Record<string, unknown>[] = await res.json();
      const entries: NormalizedLegislation[] = data.map(source.normalize);

      for (const entry of entries) {
        await prisma.legislationEntry.upsert({
          where: { externalId: entry.externalId },
          update: {
            status: entry.status,
            summary: entry.summary,
            keyProvisions: entry.keyProvisions,
            lastVerified: entry.lastVerified,
            impactLevel: entry.impactLevel,
            updatedAt: new Date(),
          },
          create: {
            externalId: entry.externalId,
            jurisdiction: entry.jurisdiction,
            region: entry.region,
            title: entry.title,
            status: entry.status,
            effectiveDate: entry.effectiveDate,
            summary: entry.summary,
            keyProvisions: entry.keyProvisions,
            sourceUrl: entry.sourceUrl,
            tags: entry.tags,
            lastVerified: entry.lastVerified,
            impactLevel: entry.impactLevel,
          },
        });
        totalUpdated++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${source.url}: ${msg}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    updated: totalUpdated,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
