import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/ui/NavBar';

export const metadata: Metadata = {
  title: 'CS Student Directory',
  description:
    'Discover talented computer science students at top universities through their published writing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">{children}</main>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://anthropic.com"
              className="text-indigo-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude AI
            </a>
            {' · '}
            Articles sourced from college newspapers
          </p>
        </footer>
      </body>
    </html>
  );
}
