import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchLatestNews } from './scraper.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'op-masters-secret-2026';

app.use(cors());
app.use(express.json());

const CARDS_FILE = path.join(__dirname, 'cards.json');
const NEWS_CACHE_FILE = path.join(__dirname, 'news_cache.json');

// Memory cache for runtime performance
let memoryNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Initialize persistent cache if it doesn't exist
if (!fs.existsSync(NEWS_CACHE_FILE)) {
    fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify({ news: [] }, null, 2));
}

// Helper to read news from disk
const readNewsCache = () => {
    try {
        const data = fs.readFileSync(NEWS_CACHE_FILE, 'utf8');
        return JSON.parse(data).news || [];
    } catch (err) {
        console.error('Error reading news cache:', err);
        return [];
    }
};

// Helper to write news to disk
const writeNewsCache = (news) => {
    try {
        fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify({ news }, null, 2));
    } catch (err) {
        console.error('Error writing news cache:', err);
    }
};

const STATIC_FALLBACK_NEWS = [
    {
        title: "EB-03 'Heroines Edition' Officially Launches Feb 20, 2026",
        date: "FEB 12, 2026",
        category: "New Set Release",
        link: "https://en.onepiece-cardgame.com/news/",
        tagColor: "from-amber-500 to-orange-600"
    },
    {
        title: "OP-13 'Carrying On His Will' Reprints Confirmed for Late February Arrival",
        date: "FEB 10, 2026",
        category: "Market Alert",
        link: "https://onepiece.limitlesstcg.com/",
        tagColor: "from-blue-500 to-cyan-500"
    },
    {
        title: "OP-14 & EB-04 Analysis: Market prices stabilizing as regional events approach",
        date: "FEB 07, 2026",
        category: "Meta Shift",
        link: "https://www.tcgplayer.com/",
        tagColor: "from-emerald-500 to-teal-500"
    }
];

// Endpoint to get automated latest news
app.get('/api/news', async (req, res) => {
    const now = Date.now();
    
    // 1. Check Memory Cache
    if (memoryNews && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(memoryNews);
    }

    // 2. Try to fetch fresh news
    const freshNews = await fetchLatestNews();
    
    // 3. Logic to ensure 3-5 items
    let finalNews = [];
    let diskCache = readNewsCache();

    if (freshNews && freshNews.length > 0) {
        const combined = [...freshNews, ...diskCache];
        const uniqueTitles = new Set();
        finalNews = combined.filter(item => {
            if (uniqueTitles.has(item.title)) return false;
            uniqueTitles.add(item.title);
            return true;
        }).slice(0, 5);

        writeNewsCache(finalNews);
    } else {
        finalNews = diskCache.length >= 3 ? diskCache.slice(0, 5) : STATIC_FALLBACK_NEWS;
    }

    // Final sanity check
    if (!finalNews || finalNews.length < 3) {
        finalNews = STATIC_FALLBACK_NEWS;
    }

    memoryNews = finalNews;
    lastFetchTime = now;
    res.json(finalNews);
});

// Helper to read cards
const readCards = () => {
    try {
        const data = fs.readFileSync(CARDS_FILE, 'utf8');
        return JSON.parse(data).cards;
    } catch (err) {
        console.error('Error reading cards file:', err);
        return [];
    }
};

// Helper to write cards
const writeCards = (cards) => {
    try {
        fs.writeFileSync(CARDS_FILE, JSON.stringify({ cards }, null, 2));
    } catch (err) {
        console.error('Error writing cards file:', err);
    }
};

// Endpoint to get all cards
app.get('/api/cards', (req, res) => {
    res.json(readCards());
});

// Endpoint to post a new card (Protected)
app.post('/api/cards', (req, res) => {
    const secret = req.headers['x-api-key'];
    if (secret !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const newCard = req.body;
    if (!newCard.id || !newCard.name) {
        return res.status(400).json({ error: 'Card ID and Name are required' });
    }

    const cards = readCards();
    cards.push(newCard);
    writeCards(cards);
    res.status(201).json(newCard);
});

// Proxy for Channel details
app.get('/api/youtube/channel', async (req, res) => {
    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching channel data:', error.message);
        res.status(500).json({ error: 'Failed to fetch channel data' });
    }
});

// Proxy for Latest Videos
app.get('/api/youtube/videos', async (req, res) => {
    try {
        const uploadsPlaylistId = req.query.playlistId;
        if (!uploadsPlaylistId) return res.status(400).json({ error: 'Playlist ID required' });

        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching playlist items:', error.message);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Proxy for Video Stats (Duration/Views)
app.get('/api/youtube/stats', async (req, res) => {
    try {
        const videoIds = req.query.ids;
        if (!videoIds) return res.status(400).json({ error: 'Video IDs required' });

        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching video stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch video stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
