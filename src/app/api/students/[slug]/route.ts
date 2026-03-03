import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const student = await prisma.student.findUnique({
    where: { slug },
    include: {
      school: { select: { name: true, slug: true, newspaper: true, url: true } },
      articles: {
        orderBy: { publishedAt: 'desc' },
        include: {
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
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  return NextResponse.json({ student });
}
