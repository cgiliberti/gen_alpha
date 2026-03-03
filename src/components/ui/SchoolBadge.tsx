import { SCHOOL_COLORS } from '@/lib/constants';

interface SchoolBadgeProps {
  schoolSlug: string;
  schoolName: string;
  size?: 'sm' | 'md';
}

export default function SchoolBadge({ schoolSlug, schoolName, size = 'md' }: SchoolBadgeProps) {
  const color = SCHOOL_COLORS[schoolSlug] ?? '#64748b';
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClass}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {schoolName}
    </span>
  );
}
