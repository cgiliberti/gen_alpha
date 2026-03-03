export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(d);
}

export function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-500';
}

export function scoreBgColor(score: number): string {
  if (score >= 8) return 'bg-green-100 text-green-800';
  if (score >= 5) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

const SHORT_NAMES: Record<string, string> = {
  'Harvard University': 'Harvard',
  'Yale University': 'Yale',
  'Princeton University': 'Princeton',
  'Columbia University': 'Columbia',
  'University of Pennsylvania': 'Penn',
  'Brown University': 'Brown',
  'Dartmouth College': 'Dartmouth',
  'Cornell University': 'Cornell',
  'Stanford University': 'Stanford',
  'MIT': 'MIT',
  'Caltech': 'Caltech',
  'Carnegie Mellon University': 'CMU',
  'Tufts University': 'Tufts',
  'Georgia Tech': 'Georgia Tech',
};

export function shortSchoolName(name: string): string {
  return SHORT_NAMES[name] ?? name.replace(' University', '').replace(' College', '');
}
