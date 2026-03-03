const CS_KEYWORDS = [
  'computer science',
  'computer sciences',
  'cs major',
  'cs student',
  'cs and',
  'and cs',
  'electrical engineering and computer science',
  'eecs',
  'computer engineering',
  'computing',
  'software engineering',
  'information science',
  'computer systems',
  'computer and cognitive sciences',
  'applied mathematics and computer science',
];

const NEGATIVE_KEYWORDS = [
  'business school',
  'law school',
  'medical school',
  'school of medicine',
  'school of law',
  'school of business',
];

export function detectCsMajor(bio: string | null): string | null {
  if (!bio) return null;
  const lower = bio.toLowerCase();

  if (NEGATIVE_KEYWORDS.some((kw) => lower.includes(kw))) return null;

  const found = CS_KEYWORDS.find((kw) => lower.includes(kw));
  return found ?? null;
}
