import axios from 'axios';
import * as cheerio from 'cheerio';

const TOPICS_URL = 'https://en.onepiece-cardgame.com/topics/';
const HOME_URL = 'https://en.onepiece-cardgame.com/';
const BASE_URL = 'https://en.onepiece-cardgame.com';

export async function fetchLatestNews() {
    let allNews = [];
    
    try {
        // Source 1: Official Topics Page
        const topicsNews = await scrapeSource(TOPICS_URL, 'dl');
        allNews = [...topicsNews];

        // Source 2: Home Page (if needed to reach 5 items)
        if (allNews.length < 5) {
            const homeNews = await scrapeSource(HOME_URL, '.topicList dl, .news dl, dl');
            // Filter out duplicates based on title
            const newItems = homeNews.filter(homeItem => 
                !allNews.some(topicItem => topicItem.title === homeItem.title)
            );
            allNews = [...allNews, ...newItems];
        }

        // Limit to 5 and ensure minimum 3 (though that depends on what's found)
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

        $(selector).each((i, dl) => {
            const $dl = $(dl);
            const title = $dl.find('.topicTit, dt').text().trim();
            const date = $dl.find('.topicDate, .ddDate').text().trim();
            const category = $dl.find('.topicCategory, .ddCategory').text().trim();
            
            // Link finding logic
            let link = $dl.closest('a').attr('href') || $dl.find('a').not('.topicCategory a').attr('href');
            if (link && !link.startsWith('http')) {
                link = BASE_URL + (link.startsWith('/') ? '' : '/') + link;
            }

            if (title && date) {
                sourceItems.push({
                    title,
                    date: date.toUpperCase(),
                    category: category || 'Intelligence',
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
