import { BaseScraper, ScrapedArticle } from '../base-scraper';

export class DartmouthScraper extends BaseScraper {
  readonly schoolSlug = 'dartmouth';
  readonly newspaperUrl = 'https://www.thedartmouth.com';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    try {
      const $ = await this.fetchHtml('https://www.thedartmouth.com/section/news');

      $('article, .story, .article-item').each((_, el) => {
        const titleEl = $(el).find('h2 a, h3 a, .headline a').first();
        const title = titleEl.text().trim();
        const relUrl = titleEl.attr('href') ?? '';
        if (!title || !relUrl) return;

        const url = relUrl.startsWith('http')
          ? relUrl
          : `${this.newspaperUrl}${relUrl}`;

        const dateStr = $(el).find('time').attr('datetime') ?? $(el).find('time').text().trim();
        const publishedAt = dateStr ? new Date(dateStr) : new Date();
        if (publishedAt < cutoff) return;

        const authorName = $(el).find('.author a, .byline a').first().text().trim() || 'Unknown';
        const summary = $(el).find('p').first().text().trim().substring(0, 500) || null;

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
      console.error(`[DartmouthScraper] Failed:`, err);
    }

    return articles;
  }

  async getArticleFullText(url: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(url);
      return $('div.article-body, .story-body, .content').text().trim() || null;
    } catch {
      return null;
    }
  }

  async getAuthorBio(profileUrl: string): Promise<string | null> {
    try {
      const $ = await this.fetchHtml(profileUrl);
      return $('div.author-bio, .contributor-bio, .staff-bio').text().trim() || null;
    } catch {
      return null;
    }
  }
}
