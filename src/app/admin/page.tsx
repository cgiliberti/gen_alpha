'use client';

import { useEffect, useState, useCallback } from 'react';

interface SchoolStat {
  name: string;
  slug: string;
  scraperKey: string;
  students: number;
  articles: number;
}

interface StatusData {
  students: number;
  articles: number;
  analyzed: number;
  unanalyzed: number;
  analysisCoverage: number;
  schools: SchoolStat[];
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        setStatus(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchStatus();
  }, [authed, fetchStatus]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
  };

  const triggerScrape = async (scraperKey?: string) => {
    setScraping(scraperKey ?? 'all');
    setMessage('');
    try {
      const body = scraperKey ? { school: scraperKey } : {};
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': secret,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          scraperKey
            ? `Scrape started for ${scraperKey}. Check server logs for progress.`
            : 'Full scrape started for all schools. Check server logs for progress.'
        );
        setTimeout(fetchStatus, 5000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Network error — check server');
    } finally {
      setScraping(null);
    }
  };

  const triggerReanalyze = async () => {
    setReanalyzing(true);
    setMessage('');
    try {
      const res = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': secret,
        },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Re-analysis done: ${data.success} succeeded, ${data.failed} failed of ${data.processed} articles.`);
        fetchStatus();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Network error — check server');
    } finally {
      setReanalyzing(false);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-24">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CRON_SECRET
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your CRON_SECRET"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Access Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => triggerScrape()}
            disabled={!!scraping}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {scraping === 'all' ? 'Scraping...' : 'Scrape All Schools'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          {message}
        </div>
      )}

      {status && (
        <>
          {/* Pipeline health summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Students', value: status.students },
              { label: 'Articles', value: status.articles },
              { label: 'Analyzed', value: status.analyzed },
              { label: 'Coverage', value: `${status.analysisCoverage}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Re-analyze unanalyzed articles */}
          {status.unanalyzed > 0 && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {status.unanalyzed} article{status.unanalyzed !== 1 ? 's' : ''} pending analysis
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  These have full text but were not yet analyzed by Claude.
                </p>
              </div>
              <button
                onClick={triggerReanalyze}
                disabled={reanalyzing}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap ml-4"
              >
                {reanalyzing ? 'Analyzing...' : 'Re-analyze (up to 20)'}
              </button>
            </div>
          )}

          {/* Per-school table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">School</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Students</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Articles</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status.schools.map((school, i) => (
                  <tr key={school.slug} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{school.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{school.students}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{school.articles}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => triggerScrape(school.scraperKey)}
                        disabled={!!scraping}
                        className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 disabled:opacity-50"
                      >
                        {scraping === school.scraperKey ? 'Starting...' : 'Scrape'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
