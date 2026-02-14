import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { fetchLatestNews } from './scraper.js';
import { OAuth2Client } from 'google-auth-library';
import Joi from 'joi';

// Google Client Init
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation Schemas
const cardSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required().min(2).max(100),
    set: Joi.string().required(),
    number: Joi.string().required(),
    rarity: Joi.string().valid('C', 'UC', 'R', 'SR', 'SEC', 'L', 'SP').required(),
    type: Joi.string().required(),
    colors: Joi.array().items(Joi.string()).min(1).required(),
    power: Joi.number().integer().min(0).allow(null),
    counter: Joi.number().integer().min(0).allow(null),
    attribute: Joi.string().allow('', null),
    effect: Joi.string().allow('', null),
    image: Joi.string().uri().allow('', null),
    price: Joi.number().min(0).default(0)
});

// Middleware for Card Validation
const validateCard = (req, res, next) => {
    const { error } = cardSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Helper to verify Google Token
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        return ticket.getPayload();
    } catch (error) {
        console.error('Google Token Verification Failed:', error);
        return null;
    }
};

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('exit', (code) => {
    console.log(`[DEBUG] Process exiting with code: ${code}`);
});

// Keep-alive to prevent premature exit if event loop drains
setInterval(() => {
    // Heartbeat
}, 60000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_SECRET || !JWT_SECRET) {
    console.warn('⚠️ WARNING: ADMIN_SECRET or JWT_SECRET is missing in .env! Security is COMPROMISED.');
}

// --- SECURITY MIDDLEWARE ---

// 1. Secure HTTP Headers
app.use(helmet());

// 2. Strict CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  'http://localhost:5174', // Added for fallback port
  'http://127.0.0.1:5174'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Allow cookies
}));

// 3. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());

// --- AUTH MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.admin_token;
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
};

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

const USERS_FILE = path.join(__dirname, 'users.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

// Helper to read/write users
const readUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data).users || [];
    } catch (err) { return []; }
};
const writeUsers = (users) => {
    try { fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2)); } catch (err) { console.error(err); }
};

// Helper to read/write transactions
const readTransactions = () => {
    try {
        if (!fs.existsSync(TRANSACTIONS_FILE)) return [];
        const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
        return JSON.parse(data).transactions || [];
    } catch (err) { return []; }
};

const writeTransactions = (transactions) => {
    try { 
        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify({ transactions }, null, 2)); 
    } catch (err) { console.error('Error writing transactions:', err); }
};

// --- TRADE ENDPOINTS ---
// Security: Trade Validation Schema
const tradeSchema = Joi.object({
    type: Joi.string().valid('buy', 'sell').required(),
    card: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().optional() // Allow price in card object, but we verify against DB
    }).unknown(true).required(),
    price: Joi.number().positive().required(),
    quantity: Joi.number().integer().positive().default(1),
    total: Joi.number().positive().required(),
    currency: Joi.string().valid('inr', 'usd', 'INR', 'USD').default('inr'),
    userEmail: Joi.string().email().required(),
    status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending')
});

app.post('/api/trade/transaction', (req, res) => {
    // 1. Validate Input Structure & Types
    const { error, value } = tradeSchema.validate(req.body);
    if (error) {
        console.warn(`[SECURITY] Blocked Invalid Trade Request: ${error.details[0].message}`);
        return res.status(400).json({ error: error.details[0].message });
    }

    const { type, card, price, quantity, total, currency, userEmail, status } = value;

    // 2. Validate Price Logic (Backend Enforcement)
    // We must fetch the REAL market price to prevent manipulation
    const allCards = readCards();
    const dbCard = allCards.find(c => c.id === card.id);

    if (!dbCard) {
        return res.status(404).json({ error: 'Card not found in database. Cannot verify market price.' });
    }

    // Logic: Limit price to 5x Market Price (approx)
    // dbCard.price is in USD usually. If transaction is in INR, we need to convert or check consistency.
    // Assuming dbCard.price is the base "Market Price".
    // 1 USD approx 83-85 INR. Let's use a safe conversion or just check relative deviation if currency matches.
    
    // For simplicity and safety, we will just use the provided Price and ensure it's not absurdly high 
    // compared to the DB price converted to the target currency.
    // Let's assume the frontend sends 'price' in the currency specified.
    
    let marketPriceInTradeCurrency = dbCard.price; 
    if (currency.toLowerCase() === 'inr') {
        marketPriceInTradeCurrency = dbCard.price * 84; // Approx fixed rate for validation
    }

    const MAX_PRICE_MULTIPLIER = 5.0;
    const MIN_PRICE_MULTIPLIER = 0.5;

    if (type === 'sell') {
        if (price > marketPriceInTradeCurrency * MAX_PRICE_MULTIPLIER) {
            console.warn(`[SECURITY] Blocked Price Manipulation: ${price} vs Max ${marketPriceInTradeCurrency * MAX_PRICE_MULTIPLIER}`);
            return res.status(400).json({ error: 'Security Alert: Price exceeds 500% of detected market value.' });
        }
        if (price < marketPriceInTradeCurrency * MIN_PRICE_MULTIPLIER) {
             console.warn(`[SECURITY] Blocked Suspicious Low Price: ${price} vs Min ${marketPriceInTradeCurrency * MIN_PRICE_MULTIPLIER}`);
             return res.status(400).json({ error: 'Security Alert: Price is too low (under 50% market value).' });
        }
    }


    const transactions = readTransactions();
    const newTransaction = {
        id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type, // 'buy' or 'sell'
        card,
        price,
        quantity: quantity || 1,
        total,
        currency: currency || 'inr',
        userEmail,
        status: status || 'pending',
        timestamp: new Date().toISOString()
    };

    transactions.push(newTransaction);
    writeTransactions(transactions);

    console.log(`[TRADE] ${type.toUpperCase()} recorded for ${userEmail}: ${card.name}`);
    res.status(201).json({ success: true, transaction: newTransaction });
});

// --- AUTH ENDPOINTS ---

app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_SECRET) {
        // Generate Token
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
        
        // Set HttpOnly Cookie
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in prod
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.json({ success: true, message: 'Authenticated' });
    } else {
        res.status(401).json({ error: 'Invalid Credentials' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Logged out' });
});

app.get('/api/auth/check', authenticateAdmin, (req, res) => {
    res.json({ authenticated: true });
});

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    
    if (!payload) {
        return res.status(401).json({ error: 'Invalid Google Token' });
    }

    // Save User to File-Based DB
    const users = readUsers();
    let user = users.find(u => u.email === payload.email);
    
    if (!user) {
        console.log(`[DEBUG] New User Detected: ${payload.email}. Saving to users.json...`);
        user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            role: 'user',
            joinedAt: new Date().toISOString()
        };
        users.push(user);
        writeUsers(users);
        console.log(`[DEBUG] User Saved. Total Users: ${users.length}`);
    } else {
        console.log(`[DEBUG] Existing User Logged In: ${payload.email}`);
    }

    // Create session (JWT)
    const sessionToken = jwt.sign({ 
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });

    // Set HttpOnly Cookie
    res.cookie('auth_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
        success: true, 
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        }
    });
});

// --- USERS ENDPOINT ---
app.get('/api/users', authenticateAdmin, (req, res) => {
    const users = readUsers();
    // Sort by joinedAt desc
    const sortedUsers = users.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    res.json({ users: sortedUsers });
});

// --- STATS ENDPOINT ---
app.get('/api/stats', authenticateAdmin, (req, res) => {
    const users = readUsers();
    const transactions = readTransactions();
    const cards = readCards();

    // Calculate Stats
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const activeListings = cards.length; // Simplified for now
    
    // Calculate Growth (Mock logic based on real data)
    const usersLastMonth = users.filter(u => new Date(u.joinedAt) > new Date(Date.now() - 30*24*60*60*1000)).length;
    const userGrowth = users.length > 0 ? ((usersLastMonth / users.length) * 100).toFixed(1) : 0;

    res.json({
        totalUsers: users.length,
        totalRevenue,
        activeListings,
        userGrowth,
        revenueGrowth: 0, // Need transaction dates for this
        listingsGrowth: 0,
        recentActivity: transactions.slice(-5).reverse() // Last 5 transactions
    });
});

// Endpoint to get all cards
app.get('/api/cards', (req, res) => {
    res.json(readCards());
});

// Endpoint to post a new card (Protected with Middleware)
app.post('/api/cards', authenticateAdmin, validateCard, (req, res) => {
    const newCard = req.body;
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
    console.log(`Server running on port ${PORT} with Secure CORS`);
});
