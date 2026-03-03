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

export abstract class BaseScraper {
  abstract readonly schoolSlug: string;
  abstract readonly newspaperUrl: string;

  protected async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
      timeout: 20000,
    });
    return cheerio.load(data);
  }

  protected async fetchXml(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      timeout: 20000,
    });
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /** Returns articles from approximately the last 48 hours. */
  abstract getRecentArticles(): Promise<ScrapedArticle[]>;

  /** Fetches the full body text of an article by URL. Returns null on failure. */
  abstract getArticleFullText(url: string): Promise<string | null>;

  /** Optionally override to fetch an author's bio from their profile page. */
  async getAuthorBio(_profileUrl: string): Promise<string | null> {
    return null;
  }

  protected cutoffDate(hoursBack = 48): Date {
    return new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  }

  protected stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
