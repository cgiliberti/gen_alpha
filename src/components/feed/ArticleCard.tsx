import Link from 'next/link';
import { ArticleWithStudentAndAnalysis } from '@/types';
import SchoolBadge from '@/components/ui/SchoolBadge';
import ScoreChip from '@/components/ui/ScoreChip';
import { formatRelativeDate, truncate } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleWithStudentAndAnalysis;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors line-clamp-2"
          >
            {article.title}
          </a>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Link
              href={`/students/${article.student.slug}`}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              {article.student.name}
            </Link>
            <SchoolBadge
              schoolSlug={article.school.slug}
              schoolName={article.school.name}
              size="sm"
            />
            <span className="text-xs text-gray-400">
              {formatRelativeDate(article.publishedAt)}
            </span>
          </div>
          {article.summary && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {truncate(article.summary, 200)}
            </p>
          )}
          {article.analysis && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <ScoreChip score={article.analysis.agencyScore} label="Agency" size="sm" />
              <ScoreChip
                score={article.analysis.orthogonalThinkingScore}
                label="Orthogonal"
                size="sm"
              />
              <ScoreChip score={article.analysis.curiosityScore} label="Curiosity" size="sm" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
