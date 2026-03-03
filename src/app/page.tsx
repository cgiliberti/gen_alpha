import { prisma } from '@/lib/prisma';
import StudentCard from '@/components/directory/StudentCard';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import { StudentCardSkeleton } from '@/components/ui/Skeleton';
import { Suspense } from 'react';

interface SearchParams {
  school?: string;
  sortBy?: string;
  order?: string;
  page?: string;
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
  const limit = 24;
  const skip = (page - 1) * limit;

  const orderByField = VALID_SORT[sortBy] ?? 'avgAgency';
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CS Student Directory</h1>
        <p className="text-gray-500 mt-1">
          Talented CS students discovered through their published writing at college newspapers.
        </p>
      </div>

      <Suspense fallback={null}>
        <DirectoryFilters />
      </Suspense>

      {students.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No students found yet.</p>
          <p className="text-sm mt-2">
            The daily scraper will populate this directory automatically. You can also trigger it
            manually via <code className="bg-gray-100 px-1 rounded">POST /api/cron</code>.
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => {
                  const next = new URLSearchParams({
                    ...(school ? { school } : {}),
                    ...(sortBy ? { sortBy } : {}),
                    ...(order ? { order } : {}),
                    page: String(p),
                  });
                  return (
                    <a
                      key={p}
                      href={`/?${next.toString()}`}
                      className={`px-3 py-1.5 rounded text-sm ${
                        p === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
