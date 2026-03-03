import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import cron from 'node-cron';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });

  // Daily scrape at 6:00 AM UTC
  cron.schedule('0 6 * * *', async () => {
    console.log('[cron] Triggering daily scrape pipeline...');
    try {
      const res = await fetch(`http://localhost:${port}/api/cron`, {
        method: 'POST',
        headers: {
          'x-cron-secret': process.env.CRON_SECRET ?? '',
          'Content-Type': 'application/json',
        },
      });
      const body = await res.json();
      console.log('[cron] Response:', body);
    } catch (err) {
      console.error('[cron] Failed to trigger pipeline:', err);
    }
  });

  console.log('[cron] Scheduled daily scrape at 6:00 AM UTC');
});
