import axios from 'axios';
import * as cheerio from 'cheerio';

const NEWS_URL = 'https://en.onepiece-cardgame.com/news/';
const TOPICS_URL = 'https://en.onepiece-cardgame.com/topics/';
const HOME_URL = 'https://en.onepiece-cardgame.com/';
const BASE_URL = 'https://en.onepiece-cardgame.com';

export async function fetchLatestNews() {
    let allNews = [];
    
    try {
        // Source 1: Official News Page
        console.log('[SCRAPER] Fetching from News page...');
        const primaryNews = await scrapeSource(NEWS_URL, '.newsListLink, .importantColBtn, .noticeListLink, dl');
        allNews = [...primaryNews];

        // Source 2: Home Page (Often has the very latest "hot" topics)
        console.log('[SCRAPER] Fetching from Home page...');
        const homeNews = await scrapeSource(HOME_URL, '.newsListLink, .noticeListLink, .topicList dl, .news dl, dl');
        
        // Merge and unique by title
        homeNews.forEach(item => {
            if (!allNews.some(existing => existing.title === item.title)) {
                allNews.push(item);
            }
        });

        // Date Parsing and Sorting
        const parseDate = (dStr) => {
            try {
                // Handle "MONTH DD, YYYY" format
                return new Date(dStr).getTime();
            } catch (e) { return 0; }
        };

        allNews.sort((a, b) => parseDate(b.date) - parseDate(a.date));

        return allNews.slice(0, 5);
    } catch (error) {
        console.error('Scraper Error:', error.message);
        return null;
    }
}

async function scrapeSource(url, selector) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(response.data);
        const sourceItems = [];

        $(selector).each((i, el) => {
            const $el = $(el);
            
            // Try home page selectors and fallback to general ones
            let title = $el.find('.newsTitle, .title, .newsListTxt, .topicTit, dt, h4, .importantColBtnTxt').first().text().trim();
            if (!title && $el.hasClass('importantColBtn')) {
                title = $el.find('span').last().text().trim();
            }

            // If still no title, maybe it's a simple a tag?
            if (!title) {
                title = $el.text().split('\n')[0].trim();
            }

            // Date extraction with fallbacks
            let date = $el.find('.newsDate, .date, time, .topicDate, .ddDate').first().text().trim();
            if (!date) {
                const dds = $el.find('dd');
                date = dds.last().text().trim();
            }
            // Another fallback: check for month name in text
            if (!date || date.length < 5) {
                const text = $el.text();
                const match = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i);
                if (match) date = match[0];
            }

            // Category extraction
            let category = $el.find('.topicCategory, .ddCategory, .newsListInfo .category, .newsListInfo div').not('time').first().text().trim();
            if (!category) {
                const dds = $el.find('dd');
                category = dds.first().text().trim();
                // If it's a date, categorizing as NEWS
                if (category === date || category.match(/\d/)) category = 'NEWS';
            }
            
            // Link finding logic
            let link = $el.attr('href') || $el.closest('a').attr('href') || $el.find('a').not('.topicCategory a').attr('href');
            if (link && !link.startsWith('http')) {
                link = BASE_URL + (link.startsWith('/') ? '' : '/') + link;
            }

            // Filter out empty or too short titles
            if (title && date && title.length > 5) {
                sourceItems.push({
                    title,
                    date: date.toUpperCase(),
                    category: category || 'NEWS',
                    link: link || url,
                    tagColor: getTagColor(category)
                });
            }
        });

        return sourceItems;
    } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
        return [];
    }
}

function getTagColor(category) {
    const cat = category.toUpperCase();
    if (cat.includes('PRODUCT')) return 'from-amber-500 to-orange-600';
    if (cat.includes('EVENT')) return 'from-blue-500 to-cyan-500';
    if (cat.includes('RULE')) return 'from-slate-500 to-slate-700';
    if (cat.includes('CARDS')) return 'from-emerald-500 to-teal-500';
    if (cat.includes('TOPIC') || cat.includes('NEWS')) return 'from-purple-500 to-indigo-600';
    return 'from-pink-500 to-rose-500';
}
