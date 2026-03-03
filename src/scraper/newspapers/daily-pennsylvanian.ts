import { BaseScraper, ScrapedArticle } from '../base-scraper';
import * as cheerio from 'cheerio';

export class DPScraper extends BaseScraper {
  readonly schoolSlug = 'penn';
  readonly newspaperUrl = 'https://www.thedp.com';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    try {
      const xml = await this.fetchXml('https://www.thedp.com/rss.xml');
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
      console.error(`[DPScraper] Failed:`, err);
    }

    return articles;
  }

  async getArticleFullText(url: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(url);
      return $('div.article-body, .story-body, .content-body').text().trim() || null;
    } catch {
      return null;
    }
  }

  async getAuthorBio(profileUrl: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(profileUrl);
      return $('div.author-bio, .contributor-bio').text().trim() || null;
    } catch {
      return null;
    }
  }
}
