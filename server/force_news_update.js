import { fetchLatestNews } from './scraper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NEWS_CACHE_FILE = path.join(__dirname, 'news_cache.json');

async function forceNewsUpdate() {
    try {
        console.log('[FORCE NEWS] Starting scraper...');
        const news = await fetchLatestNews();
        if (news && news.length > 0) {
            fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify({ news, lastUpdated: new Date().toISOString() }, null, 2));
            console.log(`[FORCE NEWS] Success! Cached ${news.length} news items.`);
            console.log(`[FORCE NEWS] Latest item: ${news[0].title} (${news[0].date})`);
        } else {
            console.warn('[FORCE NEWS] No news found. Check selectors!');
        }
    } catch (err) {
        console.error('[FORCE NEWS] Failed:', err.message);
    }
}

forceNewsUpdate();
