import { prisma } from '@/lib/prisma';
import { scrapers } from './index';
import { detectCsMajor } from './cs-detector';
import { slugify, sleep } from '@/lib/utils';
import { analyzeArticle } from '@/analysis/analyze-article';
import { updateStudentScores } from '@/analysis/update-student-scores';

export async function runAllScrapers(): Promise<void> {
  const schools = await prisma.school.findMany();

  for (const school of schools) {
    await runSchoolScraper(school.scraperKey, school.id, school.name);
  }
}

export async function runSchoolScraper(
  scraperKey: string,
  schoolId: number,
  schoolName: string
): Promise<void> {
  const scraper = scrapers[scraperKey];
  if (!scraper) {
    console.warn(`[scraper-runner] No scraper found for key: ${scraperKey}`);
    return;
  }

  console.log(`[scraper-runner] Starting scrape for ${schoolName}...`);
  let articlesFound = 0;
  let studentsFound = 0;
  let skipped = 0;
  let noBio = 0;
  let notCs = 0;

  try {
    const scrapedArticles = await scraper.getRecentArticles();
    console.log(`[scraper-runner] ${schoolName}: found ${scrapedArticles.length} recent articles`);

    for (const scraped of scrapedArticles) {
      try {
        // Skip if already in DB
        const existing = await prisma.article.findUnique({ where: { url: scraped.url } });
        if (existing) {
          skipped++;
          continue;
        }

        // Try to get author bio (in priority order)
        let bio = scraped.authorBio;

        if (!bio && scraped.authorProfileUrl) {
          bio = await scraper.getAuthorBio(scraped.authorProfileUrl).catch(() => null);
        }

        // Fall back to bio from article page (no more `any` cast)
        if (!bio) {
          bio = await scraper.getBioFromArticlePage(scraped.url);
        }

        if (!bio) {
          noBio++;
          continue;
        }

        // Detect CS major
        const keyword = detectCsMajor(bio);
        if (!keyword) {
          notCs++;
          continue;
        }

        // Upsert student
        const studentSlug = slugify(`${scraped.authorName}-${scraper.schoolSlug}`);
        const student = await prisma.student.upsert({
          where: { slug: studentSlug },
          create: {
            name: scraped.authorName,
            slug: studentSlug,
            schoolId,
            bio,
            majorKeyword: keyword,
            profileUrl: scraped.authorProfileUrl,
            avatarUrl: scraped.authorAvatarUrl,
          },
          update: {
            bio: bio ?? undefined,
            avatarUrl: scraped.authorAvatarUrl ?? undefined,
          },
        });

        const isNewStudent = student.articleCount === 0;
        if (isNewStudent) studentsFound++;

        // Fetch full text
        let fullText = scraped.fullText;
        if (!fullText) {
          fullText = await scraper.getArticleFullText(scraped.url).catch(() => null);
        }

        const snippet = scraped.summary ?? (fullText ? fullText.substring(0, 500) : null);

        // Create article
        const article = await prisma.article.create({
          data: {
            title: scraped.title,
            url: scraped.url,
            publishedAt: scraped.publishedAt,
            summary: snippet,
            fullText,
            imageUrl: scraped.imageUrl,
            schoolId,
            studentId: student.id,
          },
        });

        articlesFound++;

        // Analyze with Claude if we have enough text
        if (fullText && fullText.length > 150) {
          try {
            await sleep(500); // Rate limit courtesy
            const analysis = await analyzeArticle({
              title: article.title,
              fullText,
              authorName: student.name,
            });

            await prisma.articleAnalysis.create({
              data: {
                articleId: article.id,
                ...analysis,
              },
            });

            await prisma.article.update({
              where: { id: article.id },
              data: { analyzed: true },
            });

            await updateStudentScores(student.id);
          } catch (analysisErr) {
            console.error(
              `[scraper-runner] Analysis failed for article ${article.id}:`,
              analysisErr
            );
          }
        }
      } catch (articleErr) {
        console.error(`[scraper-runner] Error processing article ${scraped.url}:`, articleErr);
      }
    }
  } catch (err) {
    console.error(`[scraper-runner] Fatal error for ${schoolName}:`, err);
  }

  console.log(
    `[scraper-runner] ${schoolName} done — ` +
    `${articlesFound} new articles, ${studentsFound} new students | ` +
    `skipped=${skipped} noBio=${noBio} notCS=${notCs}`
  );
}
