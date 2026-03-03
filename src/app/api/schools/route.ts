import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const schools = await prisma.school.findMany({
    include: {
      _count: { select: { students: true, articles: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ schools });
}
