import { BaseScraper, ScrapedArticle } from '../base-scraper';

export class TechniqueScraper extends BaseScraper {
  readonly schoolSlug = 'gatech';
  readonly newspaperUrl = 'https://nique.net';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    try {
      const $ = await this.fetchHtml('https://nique.net/news/');

      $('article, .post, .entry').each((_, el) => {
        const titleEl = $(el).find('h2 a, h3 a, .entry-title a').first();
        const title = titleEl.text().trim();
        const relUrl = titleEl.attr('href') ?? '';
        if (!title || !relUrl) return;

        const url = relUrl.startsWith('http')
          ? relUrl
          : `${this.newspaperUrl}${relUrl}`;

        const dateStr = $(el).find('time').attr('datetime') ?? $(el).find('time').text().trim();
        const publishedAt = dateStr ? new Date(dateStr) : new Date();
        if (publishedAt < cutoff) return;

        const authorName = $(el).find('.author a, .byline a, .entry-author').first().text().trim() || 'Unknown';
        const summary = $(el).find('p, .entry-summary').first().text().trim().substring(0, 500) || null;

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
      console.error(`[TechniqueScraper] Failed:`, err);
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
