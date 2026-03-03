import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const school = searchParams.get('school');
  const sortBy = searchParams.get('sortBy') ?? 'avgAgency';
  const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 24)));
  const skip = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    agency: 'avgAgency',
    orthogonalThinking: 'avgOrthogonalThinking',
    curiosity: 'avgCuriosity',
    name: 'name',
    articleCount: 'articleCount',
  };
  const orderByField = validSortFields[sortBy] ?? 'avgAgency';

  const where = school ? { school: { slug: school } } : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { school: { select: { name: true, slug: true } } },
      orderBy: { [orderByField]: order },
      skip,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({ students, total, page, limit });
}
