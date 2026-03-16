import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import {
  normalizeInternational,
  normalizeUsState,
  normalizeUsFederal,
  type NormalizedLegislation,
} from '../../src/lib/legislation-normalizer';

const prisma = new PrismaClient();

async function seedLegislation() {
  const dataDir = path.join(process.cwd(), 'data/legislation');

  const international: NormalizedLegislation[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'international.json'), 'utf-8')
  ).map(normalizeInternational);

  const usState: NormalizedLegislation[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'us_state.json'), 'utf-8')
  ).map(normalizeUsState);

  const usFederal: NormalizedLegislation[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'us_federal.json'), 'utf-8')
  ).map(normalizeUsFederal);

  const allEntries = [...international, ...usState, ...usFederal];
  let upserted = 0;

  for (const entry of allEntries) {
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
    upserted++;
  }

  process.stdout.write(`Seeded ${upserted} legislation entries\n`);
}

seedLegislation()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
