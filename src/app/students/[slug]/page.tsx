import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import SchoolBadge from '@/components/ui/SchoolBadge';
import TraitBar from '@/components/ui/TraitBar';
import TraitRadar from '@/components/profile/TraitRadar';
import ScoreChip from '@/components/ui/ScoreChip';
import { formatDate } from '@/lib/utils';
import { TRAIT_DESCRIPTIONS } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const student = await prisma.student.findUnique({
    where: { slug },
    include: {
      school: true,
      articles: {
        orderBy: { publishedAt: 'desc' },
        include: {
          analysis: true,
        },
      },
    },
  });

  if (!student) notFound();

  const analyzedCount = student.articles.filter((a) => a.analysis).length;
  const hasScores =
    student.avgAgency !== null ||
    student.avgOrthogonalThinking !== null ||
    student.avgCuriosity !== null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-indigo-600 hover:underline mb-6 block">
        ← Back to Directory
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: profile info + radar */}
        <div className="space-y-6">
          {/* Avatar + name */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl mx-auto mb-4">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
            <div className="mt-2">
              <SchoolBadge
                schoolSlug={student.school.slug}
                schoolName={student.school.name}
              />
            </div>
            {student.majorKeyword && (
              <p className="text-xs text-gray-400 mt-2 capitalize">{student.majorKeyword}</p>
            )}
            {student.profileUrl && (
              <a
                href={student.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline mt-3 block"
              >
                View author page →
              </a>
            )}
          </div>

          {/* Trait scores */}
          {hasScores && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Trait Scores
              </h2>
              <TraitRadar
                agency={student.avgAgency}
                orthogonalThinking={student.avgOrthogonalThinking}
                curiosity={student.avgCuriosity}
              />
              <div className="space-y-3 mt-4">
                <TraitBar trait="agency" score={student.avgAgency} />
                <TraitBar trait="orthogonalThinking" score={student.avgOrthogonalThinking} />
                <TraitBar trait="curiosity" score={student.avgCuriosity} />
              </div>
              <p className="text-xs text-gray-400">
                Averaged across {analyzedCount} analyzed article
                {analyzedCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Trait descriptions */}
          <div className="bg-slate-50 rounded-xl border border-gray-200 p-5 space-y-3 text-xs text-gray-500">
            <p>
              <strong className="text-gray-700">Agency:</strong>{' '}
              {TRAIT_DESCRIPTIONS.agency}
            </p>
            <p>
              <strong className="text-gray-700">Orthogonal Thinking:</strong>{' '}
              {TRAIT_DESCRIPTIONS.orthogonalThinking}
            </p>
            <p>
              <strong className="text-gray-700">Curiosity:</strong>{' '}
              {TRAIT_DESCRIPTIONS.curiosity}
            </p>
          </div>
        </div>

        {/* Right column: articles */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Articles ({student.articles.length})
          </h2>

          {student.articles.length === 0 && (
            <p className="text-gray-400 text-sm">No articles found yet.</p>
          )}

          {student.articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors line-clamp-2"
                  >
                    {article.title}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">
                    {student.school.newspaper} · {formatDate(article.publishedAt)}
                  </p>
                  {article.summary && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{article.summary}</p>
                  )}
                </div>
              </div>

              {article.analysis && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <ScoreChip score={article.analysis.agencyScore} />
                      <p className="text-xs text-gray-400 mt-1">Agency</p>
                    </div>
                    <div className="text-center">
                      <ScoreChip score={article.analysis.orthogonalThinkingScore} />
                      <p className="text-xs text-gray-400 mt-1">Orthogonal</p>
                    </div>
                    <div className="text-center">
                      <ScoreChip score={article.analysis.curiosityScore} />
                      <p className="text-xs text-gray-400 mt-1">Curiosity</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p>
                      <strong className="text-gray-700">Agency: </strong>
                      {article.analysis.agencyReasoning}
                    </p>
                    <p>
                      <strong className="text-gray-700">Orthogonal Thinking: </strong>
                      {article.analysis.orthogonalThinkingReasoning}
                    </p>
                    <p>
                      <strong className="text-gray-700">Curiosity: </strong>
                      {article.analysis.curiosityReasoning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
