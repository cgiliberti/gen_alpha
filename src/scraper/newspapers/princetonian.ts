import { BaseScraper, ScrapedArticle } from '../base-scraper';

export class PrincetonianScraper extends BaseScraper {
  readonly schoolSlug = 'princeton';
  readonly newspaperUrl = 'https://www.dailyprincetonian.com';

  async getRecentArticles(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const cutoff = this.cutoffDate();

    try {
      const $ = await this.fetchHtml('https://www.dailyprincetonian.com/section/news');

      $('article, .article-item, .story').each((_, el) => {
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

        const authorName = $(el).find('.author a, .byline a, .contrib a').first().text().trim() || 'Unknown';
        const summary = $(el).find('p, .dek, .summary').first().text().trim().substring(0, 500) || null;
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
      console.error(`[PrincetonianScraper] Failed:`, err);
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
