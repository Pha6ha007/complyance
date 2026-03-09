import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed regulatory updates (examples)
  await prisma.regulatoryUpdate.createMany({
    data: [
      {
        title: 'EU AI Act officially enters into force',
        summary:
          'The EU AI Act (Regulation 2024/1689) has officially entered into force. High-risk AI systems must comply by August 2, 2026.',
        source: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
        regulation: 'EU_AI_ACT',
        impact:
          'All providers and deployers of high-risk AI systems in EU must achieve compliance within 24 months.',
        publishedAt: new Date('2024-08-01'),
      },
      {
        title: 'NIST AI Risk Management Framework 1.0 released',
        summary:
          'NIST published the AI Risk Management Framework (AI RMF 1.0) to help organizations manage AI risks.',
        source: 'https://www.nist.gov/itl/ai-risk-management-framework',
        regulation: 'NIST_RMF',
        publishedAt: new Date('2023-01-26'),
      },
      {
        title: 'Colorado AI Act signed into law',
        summary:
          'Colorado becomes first US state to regulate high-risk AI systems with the Colorado Artificial Intelligence Act (SB24-205).',
        source:
          'https://leg.colorado.gov/bills/sb24-205',
        regulation: 'COLORADO',
        impact:
          'Developers and deployers of high-risk AI systems in Colorado must implement risk management programs by February 1, 2026.',
        publishedAt: new Date('2024-05-17'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
