import { getClaudeClient } from '@/lib/claude';
import { sleep } from '@/lib/utils';

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
  // Use first 2500 + last 1500 chars to capture both opening argument and conclusion
  let body: string;
  if (fullText.length <= 4000) {
    body = fullText;
  } else {
    body = fullText.substring(0, 2500) + '\n\n[...]\n\n' + fullText.substring(fullText.length - 1500);
  }

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

function clampScore(value: unknown): number {
  const n = Number(value);
  if (!isFinite(n)) throw new Error(`Invalid score value: ${value}`);
  return Math.max(1, Math.min(10, Math.round(n)));
}

function parseAnalysisJson(text: string): AnalysisResult {
  // Strip accidental markdown code fences
  let jsonText = text.replace(/```json\s*|\s*```/g, '').trim();

  // Try to extract JSON object if there's surrounding text
  const match = jsonText.match(/\{[\s\S]*\}/);
  if (match) jsonText = match[0];

  const parsed = JSON.parse(jsonText);

  return {
    agencyScore: clampScore(parsed.agency?.score),
    agencyReasoning: String(parsed.agency?.reasoning ?? ''),
    orthogonalThinkingScore: clampScore(parsed.orthogonalThinking?.score),
    orthogonalThinkingReasoning: String(parsed.orthogonalThinking?.reasoning ?? ''),
    curiosityScore: clampScore(parsed.curiosity?.score),
    curiosityReasoning: String(parsed.curiosity?.reasoning ?? ''),
    rawResponse: text,
  };
}

export async function analyzeArticle(
  article: { title: string; fullText: string; authorName: string },
  retries = 2
): Promise<AnalysisResult> {
  const client = getClaudeClient();
  const prompt = buildPrompt(article.title, article.fullText, article.authorName);
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const rawText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      return parseAnalysisJson(rawText);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = 2000 * Math.pow(2, attempt); // 2s, 4s
        console.warn(`[analyze-article] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err);
        await sleep(delay);
      }
    }
  }

  throw lastErr;
}
