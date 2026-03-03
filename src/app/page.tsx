import { prisma } from '@/lib/prisma';
import StudentCard from '@/components/directory/StudentCard';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import { StudentCardSkeleton } from '@/components/ui/Skeleton';
import { Suspense } from 'react';
import Link from 'next/link';

interface SearchParams {
  school?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  q?: string;
  hasScores?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const VALID_SORT: Record<string, string> = {
  agency: 'avgAgency',
  orthogonalThinking: 'avgOrthogonalThinking',
  curiosity: 'avgCuriosity',
  name: 'name',
  articleCount: 'articleCount',
};

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const school = sp.school;
  const sortBy = sp.sortBy ?? 'agency';
  const order = (sp.order ?? 'desc') as 'asc' | 'desc';
  const page = Math.max(1, Number(sp.page ?? 1));
  const q = sp.q?.trim();
  // Default to showing only analyzed students (hasScores=true unless explicitly 'false')
  const hasScores = sp.hasScores !== 'false';
  const limit = 24;
  const skip = (page - 1) * limit;

  const orderByField = VALID_SORT[sortBy] ?? 'avgAgency';

  const where: Record<string, unknown> = {};
  if (school) where.school = { slug: school };
  if (q) where.name = { contains: q };
  if (hasScores) where.avgAgency = { not: null };

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CS Student Directory</h1>
        <p className="text-gray-500 mt-1">
          Talented CS students discovered through their published writing at college newspapers.
        </p>
      </div>

      <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded-lg mb-6" />}>
        <DirectoryFilters />
      </Suspense>

      {/* hasScores toggle */}
      <div className="mb-4 flex items-center gap-3 text-sm">
        {hasScores ? (
          <>
            <span className="text-gray-500">Showing analyzed students only.</span>
            <Link
              href={`/?${new URLSearchParams({ ...(school ? { school } : {}), ...(q ? { q } : {}), hasScores: 'false' }).toString()}`}
              className="text-indigo-600 hover:underline"
            >
              Show all students
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-500">Showing all students.</span>
            <Link
              href={`/?${new URLSearchParams({ ...(school ? { school } : {}), ...(q ? { q } : {}) }).toString()}`}
              className="text-indigo-600 hover:underline"
            >
              Show only analyzed
            </Link>
          </>
        )}
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-lg font-medium text-gray-600">No students found yet.</p>
          <p className="text-sm mt-2 max-w-sm mx-auto">
            {q ? (
              <>No students matching &quot;{q}&quot;. Try a different name.</>
            ) : (
              <>
                The daily scraper populates this directory automatically. Visit the{' '}
                <Link href="/admin" className="text-indigo-600 hover:underline">
                  admin panel
                </Link>{' '}
                to trigger a scrape manually.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} student{total !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student as any} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <a
                  href={`/?${new URLSearchParams({ ...(school ? { school } : {}), ...(q ? { q } : {}), sortBy, order, page: String(page - 1) }).toString()}`}
                  className="px-3 py-1.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  &larr; Prev
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => {
                  const params = new URLSearchParams({
                    ...(school ? { school } : {}),
                    ...(q ? { q } : {}),
                    sortBy,
                    order,
                    page: String(p),
                  });
                  return (
                    <span key={p} className="flex items-center gap-2">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-gray-400 text-sm">&hellip;</span>
                      )}
                      <a
                        href={`/?${params.toString()}`}
                        className={`px-3 py-1.5 rounded text-sm ${
                          p === page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </a>
                    </span>
                  );
                })}
              {page < totalPages && (
                <a
                  href={`/?${new URLSearchParams({ ...(school ? { school } : {}), ...(q ? { q } : {}), sortBy, order, page: String(page + 1) }).toString()}`}
                  className="px-3 py-1.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Next &rarr;
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
