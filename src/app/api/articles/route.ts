import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const school = searchParams.get('school');
  const studentSlug = searchParams.get('student');
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const skip = (page - 1) * limit;

  const analyzed = searchParams.get('analyzed');

  const where: Record<string, unknown> = {};
  if (school) where.school = { slug: school };
  if (studentSlug) where.student = { slug: studentSlug };
  if (analyzed === 'true') where.analyzed = true;
  if (analyzed === 'false') where.analyzed = false;

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, slug: true } },
          school: { select: { name: true, slug: true } },
          analysis: {
            select: {
              agencyScore: true,
              agencyReasoning: true,
              orthogonalThinkingScore: true,
              orthogonalThinkingReasoning: true,
              curiosityScore: true,
              curiosityReasoning: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total, page, limit });
  } catch (err) {
    console.error('[api/articles]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
