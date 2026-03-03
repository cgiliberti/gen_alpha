import Link from 'next/link';
import { StudentWithSchool } from '@/types';
import SchoolBadge from '@/components/ui/SchoolBadge';
import TraitBar from '@/components/ui/TraitBar';

interface StudentCardProps {
  student: StudentWithSchool;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  );
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <Link
      href={`/students/${student.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3 mb-4">
        {student.avatarUrl ? (
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <Initials name={student.name} />
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
            {student.name}
          </h3>
          <SchoolBadge schoolSlug={student.school.slug} schoolName={student.school.name} size="sm" />
        </div>
      </div>

      <div className="space-y-2">
        <TraitBar trait="agency" score={student.avgAgency} />
        <TraitBar trait="orthogonalThinking" score={student.avgOrthogonalThinking} />
        <TraitBar trait="curiosity" score={student.avgCuriosity} />
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {student.articleCount} article{student.articleCount !== 1 ? 's' : ''} analyzed
      </p>
    </Link>
  );
}
