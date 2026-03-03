# CS Student Directory

A site that discovers talented computer science students at top universities by scraping their college newspapers, then analyzing each article for three intellectual traits using Claude AI.

**Schools covered:** Harvard, Yale, Princeton, Columbia, Penn, Brown, Dartmouth, Cornell, Stanford, MIT, Caltech, CMU, Tufts, Georgia Tech

**Traits scored (1–10):**
- **Agency** — does the author take ownership, show initiative, speak with conviction?
- **Orthogonal Thinking** — does the author challenge conventional wisdom or offer genuinely non-obvious perspectives?
- **Curiosity** — does the author display genuine intellectual exploration, asking questions and seeking nuance?

---

## How It Works

1. **Scrape** — each school's newspaper is scraped for recent articles (past 48 hours; 7 days for Caltech)
2. **Detect** — authors are cross-checked to see if their bio mentions CS/tech majors
3. **Analyze** — articles with sufficient text are scored by Claude claude-opus-4-6 on the three traits
4. **Display** — students and articles are surfaced in a searchable directory and newsfeed

---

## Setup

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY and CRON_SECRET

# 3. Set up the database and seed school data
npm run db:push
npm run db:seed

# 4. Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Running Scrapes

### Via Admin Panel (easiest)
Visit [http://localhost:3000/admin](http://localhost:3000/admin), enter your `CRON_SECRET`, and click "Scrape All Schools" or scrape individual schools.

### Via API

```bash
# Scrape all schools
curl -X POST http://localhost:3000/api/cron \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json"

# Scrape a single school (scraperKey from constants.ts)
curl -X POST http://localhost:3000/api/cron \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"school": "mit"}'

# Test a scraper without writing to the database
curl -H "x-cron-secret: $CRON_SECRET" \
  "http://localhost:3000/api/test-scraper?school=mit&limit=5"

# Re-analyze articles that failed analysis
curl -X POST http://localhost:3000/api/reanalyze \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit": 20}'
```

### Automatic (Production)
The custom server (`server.ts`) schedules a full scrape daily at **6:00 AM UTC** via `node-cron`.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check — DB connectivity |
| `/api/status` | GET | Pipeline stats — student/article counts per school |
| `/api/students` | GET | Paginated student list. Params: `school`, `q`, `sortBy`, `order`, `page`, `hasScores` |
| `/api/students/[slug]` | GET | Student profile with all articles and analyses |
| `/api/articles` | GET | Paginated article feed. Params: `school`, `student`, `analyzed`, `page` |
| `/api/schools` | GET | All schools with student/article counts |
| `/api/cron` | POST | Trigger scrape (requires `x-cron-secret` header). Body: `{school?: string}` |
| `/api/test-scraper` | GET | Test a scraper without DB writes (requires `x-cron-secret` header) |
| `/api/reanalyze` | POST | Re-analyze failed articles (requires `x-cron-secret` header) |

---

## School Scraper Keys

| School | scraperKey | Newspaper |
|--------|-----------|-----------|
| Harvard | `crimson` | The Harvard Crimson |
| Yale | `ydn` | Yale Daily News |
| Princeton | `princetonian` | The Daily Princetonian |
| Columbia | `spectator` | Columbia Spectator |
| Penn | `dp` | The Daily Pennsylvanian |
| Brown | `herald` | The Brown Daily Herald |
| Dartmouth | `dartmouth` | The Dartmouth |
| Cornell | `sun` | Cornell Daily Sun |
| Stanford | `stanforddaily` | The Stanford Daily |
| MIT | `thetech` | The Tech |
| Caltech | `caltech` | The California Tech |
| CMU | `tartan` | The Tartan |
| Tufts | `tuftsdaily` | Tufts Daily |
| Georgia Tech | `technique` | The Technique |

---

## Architecture

```
Next.js 15 (App Router) + TypeScript
├── src/scraper/          # 14 newspaper scrapers + CS detection
│   ├── base-scraper.ts   # Abstract base with retry logic
│   ├── cs-detector.ts    # Keyword-based CS major detection
│   ├── scraper-runner.ts # Pipeline orchestration
│   └── newspapers/       # One file per school
├── src/analysis/         # Claude AI integration
│   ├── analyze-article.ts       # Scoring prompt + retry
│   └── update-student-scores.ts # Aggregate averages
├── src/app/              # Next.js pages and API routes
│   ├── page.tsx          # Directory (/)
│   ├── feed/             # Article newsfeed (/feed)
│   ├── students/[slug]/  # Student profile
│   ├── admin/            # Admin dashboard
│   └── api/              # REST API routes
├── src/components/       # React UI components
├── src/lib/              # Prisma client, Claude client, utilities
└── prisma/
    └── schema.prisma     # 4 models: School, Student, Article, ArticleAnalysis
```

**Database:** SQLite via Prisma (single file, no external DB needed)
**Analysis model:** Claude claude-opus-4-6 via Anthropic API
**Scraping:** Axios + Cheerio (HTML), with RSS feeds preferred where available
**Scheduling:** node-cron (daily 6 AM UTC)

---

## Database Commands

```bash
# Apply schema changes (development)
npm run db:push

# Open Prisma Studio (DB GUI)
npm run db:studio

# Re-seed schools (idempotent)
npm run db:seed

# Full reset (DESTRUCTIVE — drops all data)
npm run db:reset
```

---

## Production Build

```bash
# Build Next.js app + compile custom server
npm run build:all

# Start production server
npm start
```

Set `NODE_ENV=production` and ensure `DATABASE_URL`, `ANTHROPIC_API_KEY`, and `CRON_SECRET` are set in the environment. The server will refuse to start if any are missing.
