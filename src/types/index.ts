export interface StudentWithSchool {
  id: number;
  name: string;
  slug: string;
  school: { name: string; slug: string };
  bio: string | null;
  majorKeyword: string | null;
  profileUrl: string | null;
  avatarUrl: string | null;
  avgAgency: number | null;
  avgOrthogonalThinking: number | null;
  avgCuriosity: number | null;
  articleCount: number;
}

export interface ArticleAnalysisData {
  agencyScore: number;
  agencyReasoning: string;
  orthogonalThinkingScore: number;
  orthogonalThinkingReasoning: string;
  curiosityScore: number;
  curiosityReasoning: string;
}

export interface ArticleWithStudentAndAnalysis {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  summary: string | null;
  imageUrl: string | null;
  student: { id: number; name: string; slug: string };
  school: { name: string; slug: string };
  analysis: ArticleAnalysisData | null;
}

export interface StudentProfile extends StudentWithSchool {
  articles: Array<{
    id: number;
    title: string;
    url: string;
    publishedAt: string;
    summary: string | null;
    imageUrl: string | null;
    analysis: ArticleAnalysisData | null;
  }>;
}

export type TraitKey = 'agency' | 'orthogonalThinking' | 'curiosity';
export type SortOption = 'agency' | 'orthogonalThinking' | 'curiosity' | 'name' | 'articleCount';

export const TRAIT_LABELS: Record<TraitKey, string> = {
  agency: 'Agency',
  orthogonalThinking: 'Orthogonal Thinking',
  curiosity: 'Curiosity',
};

export const TRAIT_COLORS: Record<TraitKey, string> = {
  agency: '#6366f1',
  orthogonalThinking: '#8b5cf6',
  curiosity: '#06b6d4',
};

export const TRAIT_DESCRIPTIONS: Record<TraitKey, string> = {
  agency: 'Demonstrates initiative, ownership, and action-orientation',
  orthogonalThinking: 'Challenges assumptions and offers non-obvious perspectives',
  curiosity: 'Shows genuine intellectual depth and exploratory questioning',
};
