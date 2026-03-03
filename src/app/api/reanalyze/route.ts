import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeArticle } from '@/analysis/analyze-article';
import { updateStudentScores } from '@/analysis/update-student-scores';
import { sleep } from '@/lib/utils';

/**
 * POST /api/reanalyze
 *
 * Picks up articles that have fullText but were never successfully analyzed
 * (analyzed=false). Processes up to `limit` articles per call (default: 20).
 *
 * Requires x-cron-secret header.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Number(body.limit ?? 20), 100);

  const unanalyzed = await prisma.article.findMany({
    where: {
      analyzed: false,
      fullText: { not: null },
      // Exclude articles with very short text
    },
    include: { student: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  let success = 0;
  let failed = 0;

  for (const article of unanalyzed) {
    if (!article.fullText || article.fullText.length <= 150) continue;

    try {
      await sleep(500);
      const analysis = await analyzeArticle({
        title: article.title,
        fullText: article.fullText,
        authorName: article.student.name,
      });

      await prisma.articleAnalysis.upsert({
        where: { articleId: article.id },
        create: { articleId: article.id, ...analysis },
        update: { ...analysis },
      });

      await prisma.article.update({
        where: { id: article.id },
        data: { analyzed: true },
      });

      await updateStudentScores(article.studentId);
      success++;
    } catch (err) {
      console.error(`[reanalyze] Failed for article ${article.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    processed: unanalyzed.length,
    success,
    failed,
  });
}
