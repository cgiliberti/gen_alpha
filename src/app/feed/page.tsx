import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/feed/ArticleCard';
import { SCHOOLS } from '@/lib/constants';

interface SearchParams {
  school?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const LIMIT = 20;

export default async function FeedPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const school = sp.school;
  const page = Math.max(1, Number(sp.page ?? 1));
  const skip = (page - 1) * LIMIT;

  const where = school ? { school: { slug: school } } : {};

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
      take: LIMIT,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Article Newsfeed</h1>
        <p className="text-gray-500 mt-1">
          Latest articles from CS students at top universities.
        </p>
      </div>

      {/* School filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href="/feed"
          className={`px-3 py-1.5 rounded-full text-sm border ${
            !school
              ? 'bg-indigo-600 text-white border-transparent'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Schools
        </a>
        {SCHOOLS.map((s) => (
          <a
            key={s.slug}
            href={`/feed?school=${s.slug}`}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              school === s.slug
                ? 'bg-indigo-600 text-white border-transparent'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.name
              .replace(' University', '')
              .replace('University of Pennsylvania', 'Penn')
              .replace('Carnegie Mellon University', 'CMU')}
          </a>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No articles yet.</p>
          <p className="text-sm mt-2">Run the scraper to populate the feed.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} article{total !== 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => {
                  const next = new URLSearchParams({
                    ...(school ? { school } : {}),
                    page: String(p),
                  });
                  return (
                    <a
                      key={p}
                      href={`/feed?${next.toString()}`}
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
