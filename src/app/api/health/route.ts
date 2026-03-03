import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health
 *
 * Returns service health status. Suitable for load balancer health checks.
 * Returns 200 if the database is reachable, 503 otherwise.
 */
export async function GET() {
  try {
    const schoolCount = await prisma.school.count();
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      schools: schoolCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api/health] DB check failed:', err);
    return NextResponse.json(
      { status: 'error', db: 'disconnected', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
