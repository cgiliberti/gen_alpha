// High-confidence CS keywords — a clear match is very likely a CS student
const STRONG_KEYWORDS = [
  'computer science',
  'computer sciences',
  'electrical engineering and computer science',
  'eecs',
  'computer engineering',
  'software engineering',
  'computer science and engineering',
  'cs and engineering',
  'applied mathematics and computer science',
  'computer and cognitive sciences',
  'computer science & engineering',
  'computer science and mathematics',
  'math and computer science',
];

// Medium-confidence keywords — likely CS-adjacent
const MEDIUM_KEYWORDS = [
  'cs major',
  'cs student',
  'cs and',
  'and cs',
  'compsci',
  'comp sci',
  'cse major',
  'cse student',
  'information science',
  'computer systems',
  'machine learning',
  'artificial intelligence',
  'data science',
  'statistics and machine learning',
  'operations research and information engineering',
  'information systems',
  'systems engineering',
  'computing',
];

const NEGATIVE_KEYWORDS = [
  'business school',
  'school of business',
  'law school',
  'school of law',
  'medical school',
  'school of medicine',
  'school of information', // separate from CS in some universities
  'information school',
];

const CS_KEYWORDS = [...STRONG_KEYWORDS, ...MEDIUM_KEYWORDS];

export function detectCsMajor(bio: string | null): string | null {
  if (!bio) return null;
  const lower = bio.toLowerCase();

  if (NEGATIVE_KEYWORDS.some((kw) => lower.includes(kw))) return null;

  const found = CS_KEYWORDS.find((kw) => lower.includes(kw));
  return found ?? null;
}
