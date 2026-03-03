import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAllScrapers, runSchoolScraper } from '@/scraper/scraper-runner';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const schoolKey = body.school as string | undefined;

  if (schoolKey) {
    // Run a single school's scraper
    const school = await prisma.school.findFirst({ where: { scraperKey: schoolKey } });
    if (!school) {
      return NextResponse.json({ error: `School not found: ${schoolKey}` }, { status: 404 });
    }
    // Fire and forget
    runSchoolScraper(school.scraperKey, school.id, school.name).catch((err) =>
      console.error(`[cron] ${schoolKey} failed:`, err)
    );
    return NextResponse.json({ started: true, school: schoolKey, timestamp: new Date().toISOString() });
  }

  // Fire and forget all schools
  runAllScrapers().catch((err) => console.error('[cron] Pipeline failed:', err));

  return NextResponse.json({ started: true, timestamp: new Date().toISOString() });
}
