import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/status
 *
 * Returns pipeline health stats: student and article counts, analysis
 * completion rate, and per-school breakdown.
 */
export async function GET() {
  try {
    const [studentCount, articleCount, analyzedCount, schools] = await Promise.all([
      prisma.student.count(),
      prisma.article.count(),
      prisma.article.count({ where: { analyzed: true } }),
      prisma.school.findMany({
        include: {
          _count: { select: { students: true, articles: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      students: studentCount,
      articles: articleCount,
      analyzed: analyzedCount,
      unanalyzed: articleCount - analyzedCount,
      analysisCoverage:
        articleCount > 0 ? Math.round((analyzedCount / articleCount) * 100) : 0,
      schools: schools.map((s) => ({
        name: s.name,
        slug: s.slug,
        scraperKey: s.scraperKey,
        students: s._count.students,
        articles: s._count.articles,
      })),
    });
  } catch (err) {
    console.error('[api/status]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
