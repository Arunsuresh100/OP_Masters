import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARDS_FILE = path.join(__dirname, 'cards.json');

const BASE_URL = 'https://en.onepiece-cardgame.com';
const LIST_URL = 'https://en.onepiece-cardgame.com/cardlist/';

const RARITY_MAP = {
    'Common': 'C',
    'Uncommon': 'UC',
    'Rare': 'R',
    'SuperRare': 'SR',
    'Leader': 'L',
    'SecretRare': 'SEC',
    'SpecialRare': 'SP',
    'Special': 'SP',
    'TreasureRare': 'TR',
    'Manga': 'Manga'
};

// Deterministic Pricing Logic from fetch_cards.js
const seed = (str) => {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
};

const getDeterministicStats = (cardId, code) => {
    const s = seed(cardId);
    const rEn = ((s >>> 3)  % 10000) / 10000;
    const rJp = ((s >>> 7)  % 10000) / 10000;
    const rCh = ((s >>> 11) % 10000) / 10000;
    const rVl = ((s >>> 15) % 10000) / 10000;

    const curveEn = Math.pow(rEn, 2.5);
    const curveJp = Math.pow(rJp, 2.5);

    let enMin, enMax, jpMin, jpMax;
    if      (code === 'C')     { enMin=0.10;  enMax=0.50;   jpMin=0.05;  jpMax=0.28;  }
    else if (code === 'UC')    { enMin=0.25;  enMax=3.00;   jpMin=0.12;  jpMax=1.70;  }
    else if (code === 'R')     { enMin=1.00;  enMax=12.00;  jpMin=0.50;  jpMax=7.00;  }
    else if (code === 'SR')    { enMin=3.00;  enMax=30.00;  jpMin=1.50;  jpMax=18.00; }
    else if (code === 'L')     { enMin=8.00;  enMax=65.00;  jpMin=4.00;  jpMax=38.00; }
    else if (code === 'SEC')   { enMin=20.00; enMax=200.00; jpMin=10.00; jpMax=110.00;}
    else if (code === 'SP')    { enMin=20.00; enMax=300.00; jpMin=12.00; jpMax=170.00;}
    else if (code === 'TR')    { enMin=25.00; enMax=250.00; jpMin=14.00; jpMax=140.00;}
    else if (code === 'Manga') { enMin=500.00; enMax=8000.00;jpMin=400.00; jpMax=4500.00;}
    else                       { enMin=0.10;  enMax=2.00;   jpMin=0.05;  jpMax=1.20;  }

    let priceEnglish  = parseFloat((enMin + curveEn * (enMax - enMin)).toFixed(2));
    let priceJapanese = parseFloat((jpMin + curveJp * (jpMax - jpMin)).toFixed(2));
    if (priceEnglish < priceJapanese) priceEnglish = parseFloat((priceJapanese * 1.25).toFixed(2));

    const percentChange = parseFloat(((rCh * 8) - 4).toFixed(2));
    const volume = 5 + Math.floor(rVl * 75);

    return { priceEnglish, priceJapanese, percentChange, volume };
};

export async function scrapeOfficialSet(seriesId, setName = 'OP15') {
    try {
        console.log(`[SCRAPER] Fetching series ${seriesId} (${setName})...`);
        const url = `${LIST_URL}?series=${seriesId}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const cardsRes = [];
        
        // The official site has cards in 'dl' tags or list items within resultCol
        $('dl.modalCol, .resultCol li').each((i, el) => {
            const $el = $(el);
            
            // 1. Get the actual technical ID from the element ID (preserves _p1)
            let id = $el.attr('id') || '';
            
            // 2. Get the Rarity from the infoCol text
            const fullInfo = $el.find('.infoCol').text() || $el.text();
            if (!fullInfo.includes('|')) return;

            const parts = fullInfo.split('|').map(p => p.trim());
            const textId = parts[0].replace(/\s+/g, '-').trim();
            if (!id) id = textId; // Fallback

            const rarityRaw = parts[1] || 'C';
            const name = $el.find('.cardName, h3').first().text().trim();
            
            let code = RARITY_MAP[rarityRaw] || rarityRaw;

            // Manga/Special Art Detection
            // If it has _p and is SEC -> Manga
            // If it has _p and is SR -> SP
            if (id.includes('_p')) {
                if (code === 'SEC') code = 'Manga';
                else if (code === 'SR') code = 'SP';
            }

            // Image handling (official site uses data-src for lazy loading)
            let image = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            if (image && image.includes('dummy.gif')) image = $el.find('img').attr('data-src');
            
            if (image && !image.startsWith('http')) {
                // Handle relative paths like ../images/
                if (image.startsWith('..')) {
                    image = BASE_URL + image.substring(2);
                } else {
                    image = BASE_URL + (image.startsWith('/') ? '' : '/') + image;
                }
            }

            const stats = getDeterministicStats(id, code);
            
            if (id && name && id.includes('-')) {
                cardsRes.push({
                    id,
                    name,
                    rarity: code,
                    set: setName,
                    image,
                    ...stats,
                    marketCap: parseFloat((stats.priceEnglish * stats.volume).toFixed(2)),
                    colors: [],
                    type: 'Card'
                });
            }
        });

        console.log(`[SCRAPER] Found ${cardsRes.length} cards in series ${seriesId}.`);
        return cardsRes;
    } catch (err) {
        console.error(`[SCRAPER] Failed to scrape series ${seriesId}:`, err.message);
        return [];
    }
}

async function fetchAllSeriesIds() {
    try {
        console.log('[SYNC] Fetching all series IDs from official site...');
        const res = await axios.get(LIST_URL);
        const $ = cheerio.load(res.data);
        const series = [];
        $('select[name="series"] option').each((i, el) => {
            const val = $(el).val();
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (val) {
                // Extract clean category name (e.g. ST-29, OP-01)
                let catMatch = text.match(/\[(.*?)\]/);
                let rawCat = catMatch ? catMatch[1] : (text.includes('Promotion') ? 'P' : 'Other');
                
                // Clean up ID for frontend (e.g. OP15-EB04 -> OP15, ST-29 -> ST29)
                let catId = rawCat.split('-')[0].replace(/\s+/g, '');
                
                series.push({ id: val, name: catId });
            }
        });
        return series;
    } catch (err) {
        console.error('[SYNC] Failed to fetch series list:', err.message);
        return [];
    }
}

async function runSync() {
    // Read existing
    let currentData = { cards: [] };
    if (fs.existsSync(CARDS_FILE)) {
        currentData = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
    }

    const allSeries = await fetchAllSeriesIds();
    console.log(`[SYNC] Found ${allSeries.length} series to sync.`);

    const existingIds = new Set(currentData.cards.map(c => c.id));
    let totalNew = 0;

    // Process in batches of 5 series to avoid being blocked
    for (let i = 0; i < allSeries.length; i++) {
        const s = allSeries[i];
        const cardsReady = await scrapeOfficialSet(s.id, s.name);
        
        const newCards = cardsReady.filter(c => !existingIds.has(c.id));
        if (newCards.length > 0) {
            currentData.cards = [...currentData.cards, ...newCards];
            newCards.forEach(c => existingIds.add(c.id));
            totalNew += newCards.length;
            
            // Incremental write to prevent data loss if crash
            fs.writeFileSync(CARDS_FILE, JSON.stringify(currentData, null, 2));
        }
        
        // Wait a bit between series
        await new Promise(r => setTimeout(r, 500));
    }

    if (totalNew > 0) {
        console.log(`[SYNC] Success! Added ${totalNew} new cards. Total Library: ${currentData.cards.length}`);
    } else {
        console.log('[SYNC] No new cards discovered today.');
    }
}

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runSync();
}
