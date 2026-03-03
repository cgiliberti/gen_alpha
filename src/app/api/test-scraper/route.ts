import { NextRequest, NextResponse } from 'next/server';
import { scrapers } from '@/scraper/index';

/**
 * GET /api/test-scraper?school=mit&limit=5
 *
 * Runs a scraper for the given school and returns raw scraped articles
 * without writing anything to the database. Useful for validating scrapers.
 *
 * Requires the x-cron-secret header to prevent abuse.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const school = searchParams.get('school');
  const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 50);

  if (!school) {
    const available = Object.keys(scrapers);
    return NextResponse.json({ error: 'Missing ?school= param', available });
  }

  const scraper = scrapers[school];
  if (!scraper) {
    const available = Object.keys(scrapers);
    return NextResponse.json({ error: `No scraper for school: ${school}`, available }, { status: 404 });
  }

  try {
    const articles = await scraper.getRecentArticles();
    const sample = articles.slice(0, limit);

    return NextResponse.json({
      school,
      total: articles.length,
      returned: sample.length,
      articles: sample,
    });
  } catch (err) {
    console.error(`[test-scraper] Error for ${school}:`, err);
    return NextResponse.json(
      { error: 'Scraper failed', detail: String(err) },
      { status: 500 }
    );
  }
}
