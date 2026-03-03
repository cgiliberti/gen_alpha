import { getClaudeClient } from '@/lib/claude';

export interface AnalysisResult {
  agencyScore: number;
  agencyReasoning: string;
  orthogonalThinkingScore: number;
  orthogonalThinkingReasoning: string;
  curiosityScore: number;
  curiosityReasoning: string;
  rawResponse: string;
}

function buildPrompt(title: string, fullText: string, authorName: string): string {
  const body = fullText.length > 4000 ? fullText.substring(0, 4000) + '...' : fullText;

  return `You are evaluating a college newspaper article written by a CS student. Read carefully and score the author on three intellectual traits.

ARTICLE TITLE: ${title}
AUTHOR: ${authorName}

ARTICLE TEXT:
${body}

---

SCORING DEFINITIONS:

1. AGENCY (1–10): Does the author demonstrate personal initiative, ownership of ideas, and action-orientation? A 10 means the author clearly takes ownership and speaks with confidence and conviction. A 1 means entirely passive or detached.

2. ORTHOGONAL THINKING (1–10): Does the author challenge conventional wisdom, reframe problems, or offer genuinely non-obvious perspectives? A 10 means a distinctly original viewpoint that counters mainstream assumptions. A 1 means entirely conventional.

3. CURIOSITY (1–10): Does the author display genuine intellectual curiosity — asking questions, exploring nuance, seeking to understand rather than simply inform? A 10 means the article is driven by deep exploratory questioning. A 1 means purely factual and incurious.

---

Respond ONLY with valid JSON, no markdown:
{
  "agency": { "score": <1-10>, "reasoning": "<1–2 sentence explanation>" },
  "orthogonalThinking": { "score": <1-10>, "reasoning": "<1–2 sentence explanation>" },
  "curiosity": { "score": <1-10>, "reasoning": "<1–2 sentence explanation>" }
}`;
}

export async function analyzeArticle(article: {
  title: string;
  fullText: string;
  authorName: string;
}): Promise<AnalysisResult> {
  const client = getClaudeClient();
  const prompt = buildPrompt(article.title, article.fullText, article.authorName);

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown code fences
  const jsonText = rawText.replace(/```json\s*|\s*```/g, '').trim();
  const parsed = JSON.parse(jsonText);

  return {
    agencyScore: Number(parsed.agency.score),
    agencyReasoning: String(parsed.agency.reasoning),
    orthogonalThinkingScore: Number(parsed.orthogonalThinking.score),
    orthogonalThinkingReasoning: String(parsed.orthogonalThinking.reasoning),
    curiosityScore: Number(parsed.curiosity.score),
    curiosityReasoning: String(parsed.curiosity.reasoning),
    rawResponse: rawText,
  };
}
