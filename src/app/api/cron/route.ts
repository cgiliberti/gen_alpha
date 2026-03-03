import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/scraper/scraper-runner';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fire and forget — respond immediately while pipeline runs in background
  runAllScrapers().catch((err) =>
    console.error('[cron] Pipeline failed:', err)
  );

  return NextResponse.json({
    started: true,
    timestamp: new Date().toISOString(),
  });
}
