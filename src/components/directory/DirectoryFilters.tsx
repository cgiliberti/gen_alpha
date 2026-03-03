'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SCHOOLS } from '@/lib/constants';

export default function DirectoryFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const school = params.get('school') ?? '';
  const sortBy = params.get('sortBy') ?? 'agency';
  const order = params.get('order') ?? 'desc';

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // reset to page 1
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <select
        value={school}
        onChange={(e) => update('school', e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Schools</option>
        {SCHOOLS.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => update('sortBy', e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="agency">Sort: Agency</option>
        <option value="orthogonalThinking">Sort: Orthogonal Thinking</option>
        <option value="curiosity">Sort: Curiosity</option>
        <option value="articleCount">Sort: Articles</option>
        <option value="name">Sort: Name</option>
      </select>

      <button
        onClick={() => update('order', order === 'desc' ? 'asc' : 'desc')}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-1"
      >
        {order === 'desc' ? '↓ Highest first' : '↑ Lowest first'}
      </button>
    </div>
  );
}
