import { PrismaClient, ChangeType } from '@prisma/client';
import regulatoryUpdates from './seed-data/regulatory-updates.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing regulatory updates for clean re-seed
  await prisma.regulatoryUpdateRead.deleteMany({});
  await prisma.regulatoryUpdate.deleteMany({});

  // Seed regulatory updates from JSON file
  const updateData = regulatoryUpdates.map((update) => ({
    title: update.title,
    summary: update.summary,
    source: update.source,
    regulation: update.regulation,
    changeType: update.changeType as ChangeType,
    impact: update.impact || null,
    affectedArticles: update.affectedArticles,
    publishedAt: new Date(update.publishedAt),
  }));

  await prisma.regulatoryUpdate.createMany({
    data: updateData,
    skipDuplicates: true,
  });

  console.log(`Seeded ${updateData.length} regulatory updates`);
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
