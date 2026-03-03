import { BaseScraper, ScrapedArticle } from '../base-scraper';
import * as cheerio from 'cheerio';

export class TuftsDailyScraper extends BaseScraper {
  readonly schoolSlug = 'tufts';
  readonly newspaperUrl = 'https://tuftsdaily.com';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    // Try RSS first (WordPress standard feed)
    try {
      const xml = await this.fetchXml('https://tuftsdaily.com/feed/');
      const $ = cheerio.load(xml, { xmlMode: true });

      $('item').each((_, el) => {
        const title = $(el).find('title').first().text().trim();
        const url = $(el).find('link').first().text().trim() || $(el).find('guid').text().trim();
        const pubDateStr = $(el).find('pubDate').text().trim();
        const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();
        if (publishedAt < cutoff) return;

        const authorName =
          $(el).find('dc\\:creator, creator').text().trim() ||
          $(el).find('author').text().trim() ||
          'Unknown';

        const descHtml = $(el).find('description').text();
        const summary = this.stripHtml(descHtml).substring(0, 500) || null;
        const imageUrl =
          $(el).find('media\\:content').attr('url') ??
          $(el).find('enclosure').attr('url') ??
          null;

        articles.push({
          title,
          url,
          publishedAt,
          authorName,
          authorBio: null,
          authorProfileUrl: null,
          authorAvatarUrl: null,
          summary,
          fullText: null,
          imageUrl,
        });
      });

      if (articles.length > 0) return articles;
    } catch {
      // RSS failed, fall through to HTML
    }

    // HTML fallback
    try {
      const $ = await this.fetchHtml('https://tuftsdaily.com/news/');

      $('article, .post, .story').each((_, el) => {
        const titleEl = $(el).find('h2 a, h3 a, .entry-title a').first();
        const title = titleEl.text().trim();
        const relUrl = titleEl.attr('href') ?? '';
        if (!title || !relUrl) return;

        const url = relUrl.startsWith('http') ? relUrl : `${this.newspaperUrl}${relUrl}`;

        const dateStr = $(el).find('time').attr('datetime') ?? $(el).find('time').text().trim();
        const publishedAt = dateStr ? new Date(dateStr) : new Date();
        if (publishedAt < cutoff) return;

        const authorName =
          $(el).find('.author a, .byline a, a[rel="author"]').first().text().trim() || 'Unknown';
        const summary =
          $(el).find('p, .entry-summary').first().text().trim().substring(0, 500) || null;

        articles.push({
          title,
          url,
          publishedAt,
          authorName,
          authorBio: null,
          authorProfileUrl: null,
          authorAvatarUrl: null,
          summary,
          fullText: null,
          imageUrl: null,
        });
      });
    } catch (err) {
      console.error(`[TuftsDailyScraper] Failed:`, err);
    }

    return articles;
  }

  async getArticleFullText(url: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(url);
      return $('div.entry-content, .article-body, .post-content').text().trim() || null;
    } catch {
      return null;
    }
  }

  async getAuthorBio(profileUrl: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(profileUrl);
      return $('div.author-bio, .author-description').text().trim() || null;
    } catch {
      return null;
    }
  }
}
