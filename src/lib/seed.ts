import { PrismaClient } from '@prisma/client';
import { SCHOOLS } from './constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding schools...');

  for (const school of SCHOOLS) {
    await prisma.school.upsert({
      where: { slug: school.slug },
      create: {
        name: school.name,
        slug: school.slug,
        newspaper: school.newspaper,
        url: school.url,
        scraperKey: school.scraperKey,
      },
      update: {
        name: school.name,
        newspaper: school.newspaper,
        url: school.url,
        scraperKey: school.scraperKey,
      },
    });
  }

  console.log(`Seeded ${SCHOOLS.length} schools.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
