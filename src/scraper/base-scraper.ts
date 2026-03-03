import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedArticle {
  title: string;
  url: string;
  publishedAt: Date;
  authorName: string;
  authorBio: string | null;
  authorProfileUrl: string | null;
  authorAvatarUrl: string | null;
  summary: string | null;
  fullText: string | null;
  imageUrl: string | null;
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; CSDirectoryBot/1.0; +https://github.com/gen-alpha)';

// Common CSS selectors for author bios across CMS platforms (WordPress, Arc, etc.)
const BIO_SELECTORS = [
  '.author-bio',
  '.contributor-bio',
  '.staff-bio',
  '.byline-bio',
  '.author-description',
  '.entry-author-bio',
  '[class*="author-bio"]',
  '[class*="author-description"]',
  '.contrib-bio',
  '.writer-bio',
  '.user-description',
].join(', ');

export abstract class BaseScraper {
  abstract readonly schoolSlug: string;
  abstract readonly newspaperUrl: string;

  /** Retry helper with exponential backoff. */
  private async withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 1000): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
        }
      }
    }
    throw lastErr;
  }

  protected async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    return this.withRetry(async () => {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': DEFAULT_USER_AGENT },
        timeout: 30000,
      });
      return cheerio.load(data);
    });
  }

  protected async fetchXml(url: string): Promise<string> {
    return this.withRetry(async () => {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 30000,
      });
      return typeof data === 'string' ? data : JSON.stringify(data);
    });
  }

  /** Returns articles from approximately the last 48 hours. */
  abstract getRecentArticles(): Promise<ScrapedArticle[]>;

  /** Fetches the full body text of an article by URL. Returns null on failure. */
  abstract getArticleFullText(url: string): Promise<string | null>;

  /** Optionally override to fetch an author's bio from their profile page. */
  async getAuthorBio(_profileUrl: string): Promise<string | null> {
    return null;
  }

  /**
   * Fetches an author bio from the article page itself using common CMS selectors.
   * Override in subclasses to use site-specific selectors.
   */
  async getBioFromArticlePage(url: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(url);
      return $(BIO_SELECTORS).first().text().trim() || null;
    } catch {
      return null;
    }
  }

  protected cutoffDate(hoursBack = 720): Date {
    return new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  }

  protected stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
