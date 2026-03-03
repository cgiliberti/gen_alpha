import { PrismaClient } from '@prisma/client';

const SCHOOLS = [
  { slug: 'harvard', name: 'Harvard University', newspaper: 'The Harvard Crimson', url: 'https://www.thecrimson.com', scraperKey: 'crimson' },
  { slug: 'yale', name: 'Yale University', newspaper: 'Yale Daily News', url: 'https://yaledailynews.com', scraperKey: 'ydn' },
  { slug: 'princeton', name: 'Princeton University', newspaper: 'The Daily Princetonian', url: 'https://www.dailyprincetonian.com', scraperKey: 'princetonian' },
  { slug: 'columbia', name: 'Columbia University', newspaper: 'Columbia Spectator', url: 'https://www.columbiaspectator.com', scraperKey: 'spectator' },
  { slug: 'penn', name: 'University of Pennsylvania', newspaper: 'The Daily Pennsylvanian', url: 'https://www.thedp.com', scraperKey: 'dp' },
  { slug: 'brown', name: 'Brown University', newspaper: 'The Brown Daily Herald', url: 'https://www.browndailyherald.com', scraperKey: 'herald' },
  { slug: 'dartmouth', name: 'Dartmouth College', newspaper: 'The Dartmouth', url: 'https://www.thedartmouth.com', scraperKey: 'dartmouth' },
  { slug: 'cornell', name: 'Cornell University', newspaper: 'Cornell Daily Sun', url: 'https://cornellsun.com', scraperKey: 'sun' },
  { slug: 'stanford', name: 'Stanford University', newspaper: 'The Stanford Daily', url: 'https://stanforddaily.com', scraperKey: 'stanforddaily' },
  { slug: 'mit', name: 'MIT', newspaper: 'The Tech', url: 'https://thetech.org', scraperKey: 'thetech' },
  { slug: 'caltech', name: 'Caltech', newspaper: 'The California Tech', url: 'https://tech.caltech.edu', scraperKey: 'caltech' },
  { slug: 'cmu', name: 'Carnegie Mellon University', newspaper: 'The Tartan', url: 'https://thetartan.org', scraperKey: 'tartan' },
  { slug: 'tufts', name: 'Tufts University', newspaper: 'Tufts Daily', url: 'https://tuftsdaily.com', scraperKey: 'tuftsdaily' },
  { slug: 'gatech', name: 'Georgia Tech', newspaper: 'The Technique', url: 'https://nique.net', scraperKey: 'technique' },
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding schools...');
  for (const school of SCHOOLS) {
    await prisma.school.upsert({
      where: { slug: school.slug },
      create: school,
      update: { name: school.name, newspaper: school.newspaper, url: school.url },
    });
  }
  console.log(`Done. Seeded ${SCHOOLS.length} schools.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
