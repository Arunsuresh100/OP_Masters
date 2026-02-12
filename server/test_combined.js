import { fetchLatestNews } from './scraper.js';

async function verifyHardening() {
    console.log('--- Triggering Multi-Source Intelligence Fetch ---');
    const news = await fetchLatestNews();
    
    if (!news) {
        console.error('FAILED: No news returned at all.');
        return;
    }

    console.log(`SUCCESS: Fetched ${news.length} items.`);
    
    news.forEach((item, i) => {
        console.log(`[${i+1}] ${item.category}: ${item.title}`);
        console.log(`   Link: ${item.link}`);
    });

    if (news.length < 3) {
        console.warn('WARNING: Less than 3 items found. This will trigger historical buffering in the server layer.');
    } else {
        console.log('STABILITY CHECK: Intelligence quorum reached (3+ items).');
    }
}

verifyHardening();
