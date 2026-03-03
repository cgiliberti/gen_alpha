import { BaseScraper, ScrapedArticle } from '../base-scraper';

export class CrimsonScraper extends BaseScraper {
  readonly schoolSlug = 'harvard';
  readonly newspaperUrl = 'https://www.thecrimson.com';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    try {
      const $ = await this.fetchHtml('https://www.thecrimson.com/section/news/');

      $('.story-card, .article-summary, article').each((_, el) => {
        const titleEl = $(el).find('h3 a, h2 a').first();
        const title = titleEl.text().trim();
        const relUrl = titleEl.attr('href') ?? '';
        if (!title || !relUrl) return;

        const url = relUrl.startsWith('http')
          ? relUrl
          : `${this.newspaperUrl}${relUrl}`;

        const dateStr = $(el).find('time').attr('datetime') ?? $(el).find('time').text().trim();
        const publishedAt = dateStr ? new Date(dateStr) : new Date();
        if (publishedAt < cutoff) return;

        const authorName = $(el).find('.contrib a, .author a, .byline a').first().text().trim() || 'Unknown';
        const summary = $(el).find('p, .summary').first().text().trim().substring(0, 500) || null;
        const imageUrl = $(el).find('img').attr('src') ?? null;

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
    } catch (err) {
      console.error(`[CrimsonScraper] Failed to fetch index:`, err);
    }

    return articles;
  }

  async getArticleFullText(url: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(url);
      return $('div.article-body, .story-body, article .body').text().trim() || null;
    } catch {
      return null;
    }
  }

  async getAuthorBio(profileUrl: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(profileUrl);
      return $('div.contrib-bio, .author-bio, .writer-bio').text().trim() || null;
    } catch {
      return null;
    }
  }
}
