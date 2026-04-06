import { supabase } from './lib/supabase.js';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { fetchLatestNews } from './scraper.js';
import { OAuth2Client } from 'google-auth-library';
import Joi from 'joi';
import { exec } from 'child_process';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

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

console.log(`[AUTH SYSTEM] Admin Secret Status: ${ADMIN_SECRET ? 'LOADED' : 'MISSING (Check .env)'}`);
if (ADMIN_SECRET) {
    console.log(`[AUTH SYSTEM] Loaded Secret Length: ${ADMIN_SECRET.trim().length} chars`);
}

// --- AUTH MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Access denied. Please log in.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        
        // --- REAL-TIME SESSION CHECK ---
        // If user was deleted from DB, they shouldn't be allowed to proceed.
        const { data: user, error } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', verified.id)
            .single();

        if (error || !user) {
            res.clearCookie('auth_token');
            return res.status(401).json({ error: 'Your session is no longer valid. Please log in again.' });
        }

        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Temporary storage for OTPs (In-memory for now)
const otps = new Map(); // email -> { otp, userData, expires }

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"OP Master Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔒 Your One Piece Trade Verification Code',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f59e0b; text-align: center;">Identity Verification</h2>
                <p>Welcome to <strong>OP Master</strong>! To complete your registration and secure your collection, please enter the following verification code:</p>
                <div style="background: #fdf2f2; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #b91c1c;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 10px; color: #999; text-align: center;">Mastering the Grand Line of Card Trading.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

// --- SECURITY MIDDLEWARE ---

// 1. Secure HTTP Headers
app.use(helmet());

// 2. Strict CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://one-piece-trade.vercel.app', 
  'capacitor://localhost',
  'http://localhost',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Dynamic matching for Vercel and Render domains
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                return regex.test(origin);
            }
            return allowed === origin;
        }) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[SECURITY] Blocked CORS Origin: ${origin}`);
            callback(null, false); // Don't throw error, just block
        }
    },
    credentials: true
}));

const API_URL = 'https://en.onepiece-cardgame.com/';

// --- IMAGE PROXY BYPASSES HOTLINKING BLOCKS ---
app.get('/api/card-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await axios({
            method: 'get',
            url: decodeURIComponent(url),
            responseType: 'stream',
            headers: {
                'Referer': API_URL,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        response.data.pipe(res);
    } catch (error) {
        console.error(`[PROXY ERROR] Failed to fetch image: ${url}`, error.message);
        res.status(500).send('Error fetching image');
    }
});

// 3. Rate Limiting (Expanded for Development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 10,000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('One Piece Trade Server is Live! Go to /api/cards to see data.');
});

// --- AUTH MIDDLEWARE ---
// Combined Auth: Supports both JWT Cookies (regular users) OR Admin Secret (Dashboard Integration)
const authenticateAny = async (req, res, next) => {
    // 1. Check for Admin Secret in Query (Dashboard fallback)
    const querySecret = req.query.admin_secret;
    const envSecret = (process.env.ADMIN_SECRET || 'Op_masters@100').trim();

    if (querySecret && querySecret.trim() === envSecret) {
        req.user = { role: 'admin', id: 'secret_admin', name: 'Secret Holder' };
        return next();
    }

    // 2. Fallback to Cookie-based Token (Formal Login - Admin or User)
    const token = req.cookies.admin_token || req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Authorization required.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        
        // --- REAL-TIME SESSION CHECK ---
        const { data: user, error } = await supabase
            .from('users')
            .select('id, role, name')
            .eq('id', verified.id)
            .single();

        if (error || !user) {
            res.clearCookie('admin_token');
            res.clearCookie('auth_token');
            return res.status(401).json({ error: 'Session no longer valid.' });
        }

        req.user = user;
        return next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

const authenticateAdmin = (req, res, next) => {
    // Same logic but enforces admin role
    authenticateAny(req, res, () => {
        if (req.user && req.user.role === 'admin') return next();
        res.status(403).json({ error: 'Admin access required.' });
    });
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const YOUTUBE_CACHE_FILE = path.join(__dirname, 'youtube_cache.json');
const CARDS_FILE = path.join(__dirname, 'cards.json');
const NEWS_CACHE_FILE = path.join(__dirname, 'news_cache.json');

let memoryNews = null;
let lastFetchTime = 0;

let memoryYoutube = {
    channel: null,
    videos: null,
    stats: null,
    lastFetch: { channel: 0, videos: 0, stats: 0 }
};

const YT_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// ============================================================
// LIVE MARKET VOLATILITY ENGINE (60-second price ticks)
// Each card gets micro-volatility applied every minute.
// This simulates real market movement without hitting an API.
// Architecture: Bloomberg/Binance-style in-memory state store.
// ============================================================
let marketState = {}; // { cardId: { priceEn, priceJp, change24h, prevEn, prevJp, lastTick } }
let marketStateReady = false;

// Volatility ranges by rarity (% per tick, max 0.8% for common, up to 2% for Manga)
const RARITY_VOLATILITY = {
    C: 0.003, UC: 0.004, R: 0.005, SR: 0.006,
    L: 0.008, SEC: 0.012, TR: 0.015, SP: 0.013, Manga: 0.020
};

const initMarketState = () => {
    try {
        const raw = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
        const cards = raw.cards || (Array.isArray(raw) ? raw : []);
        cards.forEach(c => {
            marketState[c.id] = {
                priceEn: c.priceEnglish,
                priceJp: c.priceJapanese,
                baseEn: c.priceEnglish,
                baseJp: c.priceJapanese,
                change24h: c.percentChange || 0,
                prevEn: c.priceEnglish,
                prevJp: c.priceJapanese,
                rarity: c.rarity,
                volume: c.volume || 10,
                lastTick: Date.now()
            };
        });
        marketStateReady = true;
        console.log(`[MARKET ENGINE] Initialized with ${cards.length} instruments. 60s tick active.`);
    } catch (e) {
        console.warn('[MARKET ENGINE] cards.json not ready yet, will retry in 30s');
        setTimeout(initMarketState, 30000);
    }
};

const tickMarket = () => {
    const now = Date.now();
    Object.keys(marketState).forEach(id => {
        const s = marketState[id];
        const vol = RARITY_VOLATILITY[s.rarity] || 0.004;
        // Small random walk: ±vol per tick
        const enDelta = s.priceEn * vol * (Math.random() * 2 - 1);
        const jpDelta = s.priceJp * vol * (Math.random() * 2 - 1);
        s.prevEn = s.priceEn;
        s.prevJp = s.priceJp;
        // Clamp to ±30% of base to prevent runaway drift
        s.priceEn = Math.max(s.baseEn * 0.70, Math.min(s.baseEn * 1.30, parseFloat((s.priceEn + enDelta).toFixed(2))));
        s.priceJp = Math.max(s.baseJp * 0.70, Math.min(s.baseJp * 1.30, parseFloat((s.priceJp + jpDelta).toFixed(2))));
        // Recalculate 24h change relative to base
        s.change24h = parseFloat((((s.priceEn - s.baseEn) / s.baseEn) * 100).toFixed(2));
        
        // Randomize volume fluctuation (±5% per tick)
        const volDelta = s.volume * 0.05 * (Math.random() * 2 - 1);
        s.volume = Math.max(1, parseFloat((s.volume + volDelta).toFixed(1)));
        
        s.lastTick = now;
    });
};

// Start market engine after 2 seconds (allow server to fully boot)
setTimeout(() => {
    initMarketState();
    setInterval(tickMarket, 60 * 1000); // tick every 60 seconds
}, 2000);


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
    
    // 1. Check Memory Cache (fastest)
    if (memoryNews && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(memoryNews);
    }

    // 2. Try to fetch fresh news
    console.log('[NEWS] Fetching fresh news...');
    const freshNews = await fetchLatestNews();
    
    let finalNews = [];
    if (freshNews && freshNews.length > 0) {
        finalNews = freshNews;
        writeNewsCache(finalNews);
    } else {
        // Fallback to disk if scraper fails
        console.warn('[NEWS] Scraper failed, falling back to disk cache.');
        finalNews = readNewsCache();
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

// --- UPDATED LOGIN ENDPOINT ---
app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    
    // Quick check: If no password at all, reject.
    if (!password) {
        return res.status(400).json({ error: 'Password/Secret is required' });
    }
    if (email) {
        email = email.toLowerCase().trim();
    }
    
    // Admin login fallback
    const expectedSecret = (ADMIN_SECRET || 'Op_masters').trim();
    const providedSecret = password.trim();

    console.log(`[LOGIN ATTEMPT] Provided length: ${providedSecret.length}, Expected length: ${expectedSecret.length}`);

    // Admin login fallback verification
    if (providedSecret === expectedSecret) {
        console.log(`[AUTH SUCCESS] Admin access granted.`);
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ success: true, message: 'Admin Authenticated' });
    }
    
    console.warn(`[AUTH FAILED] Password mismatch. Provided: "${providedSecret}"`);

    // Standard User Login (SUPABASE)
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const sessionToken = jwt.sign({ 
            id: user.id || user.email,
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        }, JWT_SECRET, { expiresIn: '24h' });

        const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        res.cookie('auth_token', sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ success: true, user: { email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- SIGNUP ENDPOINTS ---
// --- SIGNUP ENDPOINTS (Modified for Data Integrity) ---
app.post('/api/auth/signup/init', async (req, res) => {
    let { name, email, phone, password, gender, dob } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Normalization (Standardize for Security)
    email = email.toLowerCase().trim();
    phone = phone?.replace(/\D/g, '') || '';

    try {
        // 1. Check if Email or Phone already exists (Improved Syntax)
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email, phone')
            .or(`email.eq.${email},phone.eq.${phone}`)
            .maybeSingle();

        if (checkError) {
            console.error('🔍 Supabase Check Error:', checkError.message);
            throw new Error('Verification failed. Try again.');
        }

        if (existingUser) {
            if (existingUser.email === email) return res.status(400).json({ error: 'Email already registered.' });
            if (existingUser.phone === phone) return res.status(400).json({ error: 'Phone number already registered.' });
        }

        // 2. Hash Password and Create User immediately
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            gender: gender || '',
            dob: dob || null,
            auth_provider: 'local',
            role: 'user',
            joined_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase.from('users').insert([newUser]);
        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            if (insertError.code === '23505') {
                return res.status(400).json({ error: 'This email or phone is already registered.' });
            }
            throw new Error('Database insertion failed.');
        }

        // 3. Auto-Login after Signup
        const sessionToken = jwt.sign({ 
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        }, JWT_SECRET, { expiresIn: '24h' });

        const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        res.cookie('auth_token', sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ 
            success: true, 
            message: 'Account created successfully!', 
            user: { email: newUser.email, name: newUser.name } 
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message || 'Failed to create account.' });
    }
});

app.post('/api/auth/signup/verify', async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otps.get(email);
    if (!record || record.otp !== otp) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (Date.now() > record.expires) {
        otps.delete(email);
        return res.status(400).json({ error: 'Verification code expired' });
    }

    try {
        const hashedPassword = await bcrypt.hash(record.userData.password, 10);
        
        // SAVE TO SUPABASE
        const { error } = await supabase.from('users').insert([{
            id: 'user_' + Date.now(),
            name: record.userData.name,
            email: record.userData.email,
            phone: record.userData.phone || '',
            password: hashedPassword,
            role: 'user',
            joined_at: new Date().toISOString()
        }]);

        if (error) {
            console.error('Supabase Insert Error:', error);
            return res.status(500).json({ error: 'Database error: Could not save user.' });
        }

        otps.delete(email);
        res.json({ success: true, message: 'Account created successfully! You can now log in.' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Failed to create account.' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/check', authenticateAdmin, (req, res) => {
    res.json({ authenticated: true });
});

// --- ADMIN USER MANAGEMENT ---

// 1. Fetch all users from Supabase for the Directory
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, auth_provider, joined_at, role')
            .order('joined_at', { ascending: false });

        if (error) throw error;
        
        // Map to match the dashboard's expected format
        const formatted = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            loginType: u.auth_provider === 'google' ? 'google' : 'email',
            created: new Date(u.joined_at).toISOString().split('T')[0],
            active: true, // Placeholder logic for online/offline
            lastActive: 'Active'
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Admin Fetch Users Error:', err);
        res.status(500).json({ error: 'Failed to fetch user directory.' });
    }
});

// 2. Delete User permanently
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'User deleted from global registry.' });
    } catch (err) {
        console.error('Admin Delete User Error:', err);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// --- ADMIN CARD INVENTORY ---

// 1. Fetch Inventory Registry
app.get('/api/admin/inventory', authenticateAdmin, async (req, res) => {
    try {
        const { data: inventory, error } = await supabase
            .from('card_inventory')
            .select('*')
            .order('added_at', { ascending: false });

        if (error) {
            // If table doesn't exist, return empty array instead of failing
            if (error.code === '42P01') return res.json([]);
            throw error;
        }
        res.json(inventory);
    } catch (err) {
        console.error('Fetch Inventory Error:', err);
        res.status(500).json({ error: 'Failed to fetch inventory.' });
    }
});

// 2. Add Card to Inventory
app.post('/api/admin/inventory', authenticateAdmin, async (req, res) => {
    try {
        const { id, name, set, rarity, price_usd, image_url, type } = req.body;
        
        if (!id || !name) return res.status(400).json({ error: 'Asset ID and Name are required.' });

        // Upsert: Add or Update
        const { error } = await supabase
            .from('card_inventory')
            .upsert([{
                id,
                name,
                set: set || 'N/A',
                rarity: rarity || 'N/A',
                price_usd: parseFloat(price_usd) || 0,
                image_url: image_url || '',
                type: type || 'Character',
                added_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // --- NEW: Inject into Market Engine instantly ---
        const finalPrice = parseFloat(price_usd) || 0;
        marketState[id] = {
            priceEn: finalPrice,
            priceJp: finalPrice * 0.8, // Estimate JP price
            baseEn: finalPrice,
            baseJp: finalPrice * 0.8,
            change24h: 0,
            prevEn: finalPrice,
            prevJp: finalPrice,
            rarity: rarity || 'C',
            volume: 10,
            lastTick: Date.now()
        };

        res.json({ success: true, message: 'Card added to library and market engine.' });
    } catch (err) {
        console.error('Add To Inventory Error:', err);
        res.status(500).json({ error: 'Failed to add card to list.' });
    }
});

// 3. Remove Card from Inventory
app.delete('/api/admin/inventory/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        
        if (!id) return res.status(400).json({ error: 'Card ID is required for deletion.' });

        const { error } = await supabase
            .from('card_inventory')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Card purged from inventory.' });
    } catch (err) {
        console.error('Delete From Inventory Error:', err);
        res.status(500).json({ error: 'Failed to remove card.' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    const { token, access_token } = req.body;
    
    if (!token && !access_token) {
        return res.status(400).json({ error: 'Token or Access Token is required' });
    }

    let payload;
    if (token) {
        payload = await verifyGoogleToken(token);
    } else if (access_token) {
        try {
            const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
            payload = response.data;
        } catch (error) {
            console.error('Google Access Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid Google Access Token' });
        }
    }
    
    if (!payload.email) return res.status(401).json({ error: 'Google account missing email' });
    const normalizedEmail = payload.email.toLowerCase().trim();

    try {
        // 1. Check if Google user exists (Normalized Email)
        let { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (fetchError) {
            console.error('Database Fetch Error:', fetchError);
            throw fetchError;
        }

        if (!user) {
            // 2. Create New Google User in Database
            const newUser = {
                id: payload.sub || 'g_' + Date.now(),
                email: payload.email,
                name: payload.name,
                role: 'user',
                auth_provider: 'google',
                joined_at: new Date().toISOString()
            };
            const { error: insertError } = await supabase.from('users').insert([newUser]);
            if (insertError) {
                console.error('Supabase Insert Error (Google):', insertError);
                throw insertError;
            }
            user = newUser; // Set user for JWT
            console.log(`[DEBUG] New Google User saved to Database: ${payload.email}`);
        } else {
            console.log(`[DEBUG] Existing Google User Logged In: ${payload.email}`);
        }

        // 3. Create session (JWT)
        const sessionToken = jwt.sign({ 
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_SECRET, { expiresIn: '24h' });

        const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        res.cookie('auth_token', sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ error: 'Google Login failed.' });
    }
});

// --- PROFILE & DASHBOARD ENDPOINTS ---

// 1. Update Profile (Name/Avatar)
app.patch('/api/users/profile', authenticateToken, async (req, res) => {
    const { name, avatar_id } = req.body;
    const userId = req.user.id;

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (avatar_id) updateData.avatar_id = avatar_id;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, user: data });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

// 2. Vault (Inventory) Endpoints
app.get('/api/user/vault', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_inventory')
            .select('card_id, quantity')
            .eq('user_id', req.user.id);
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Vault fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch vault.' });
    }
});

app.post('/api/user/vault', authenticateToken, async (req, res) => {
    const { card_id, quantity } = req.body;
    try {
        const { error } = await supabase
            .from('user_inventory')
            .upsert({ user_id: req.user.id, card_id, quantity }, { onConflict: 'user_id,card_id' });
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Vault update error:', err);
        res.status(500).json({ error: 'Failed to update vault.' });
    }
});

app.delete('/api/user/vault/:card_id', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('user_inventory')
            .delete()
            .eq('user_id', req.user.id)
            .eq('card_id', req.params.card_id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Vault delete error:', err);
        res.status(500).json({ error: 'Failed to remove from vault.' });
    }
});

// 3. Wishlist Endpoints
app.get('/api/user/wishlist', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_wishlist')
            .select('card_id')
            .eq('user_id', req.user.id);
        
        if (error) throw error;
        res.json(data.map(item => item.card_id));
    } catch (err) {
        console.error('Wishlist fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch wishlist.' });
    }
});

app.post('/api/user/wishlist', authenticateToken, async (req, res) => {
    const { card_id } = req.body;
    try {
        const { error } = await supabase
            .from('user_wishlist')
            .insert([{ user_id: req.user.id, card_id }]);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Wishlist update error:', err);
        res.status(500).json({ error: 'Failed to add to wishlist.' });
    }
});

app.delete('/api/user/wishlist/:card_id', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('user_wishlist')
            .delete()
            .eq('user_id', req.user.id)
            .eq('card_id', req.params.card_id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Wishlist delete error:', err);
        res.status(500).json({ error: 'Failed to remove from wishlist.' });
    }
});

// --- USERS ENDPOINT ---
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// --- ADMIN STATISTICS ENDPOINT ---
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        // 1. Fetch Totals from Supabase (Exclude Admins)
        const { count: userCount } = await supabase.from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');
        const { count: manualCardCount } = await supabase.from('card_inventory').select('*', { count: 'exact', head: true });
        
        // Count from local JSON + manual
        const cards = readCards();
        const totalCardCount = (cards?.length || 0) + (manualCardCount || 0);

        // 2. Fetch Support Stats (Enquiries and Pending Replies)
        const { data: tickets } = await supabase.from('support_tickets').select('status');
        const supportStats = {
            total: tickets?.length || 0,
            pending: tickets?.filter(t => ['pending', 'open'].includes(t.status)).length || 0
        };

        // 3. Hourly Momentum Tracker (LAST 12 HOURS)
        // Tracks both New Signups AND Support Thread Activity
        const hourlyActivity = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hours = time.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            const hourStr = `${h12}${ampm}`;
            hourlyActivity.push({ 
                name: hourStr, 
                users: 0, 
                hour: hours, 
                date: time.getDate() 
            });
        }

        const startOfRange = new Date(now.getTime() - 12 * 60 * 60 * 1000);

        // A. Track New Signups (Exclude Admins)
        const { data: recentUsers } = await supabase
            .from('users')
            .select('joined_at')
            .gte('joined_at', startOfRange.toISOString())
            .eq('role', 'user');

        // B. Track Message Activity (Exclude Admin Replies)
        const { data: recentMessages } = await supabase
            .from('support_messages')
            .select('created_at')
            .gte('created_at', startOfRange.toISOString())
            .eq('is_admin', false);

        // Combine into buckets
        const processStats = (list, field) => {
            if (!list) return;
            list.forEach(item => {
                const itemDate = new Date(item[field]);
                const itemHour = itemDate.getHours();
                const itemDay = itemDate.getDate();
                const bucket = hourlyActivity.find(h => h.hour === itemHour && h.date === itemDay);
                if (bucket) bucket.users++;
            });
        };

        processStats(recentUsers, 'joined_at');
        processStats(recentMessages, 'created_at');

        const finalizedActivity = hourlyActivity.map(h => ({
           name: h.name,
           users: h.users
        }));

        res.json({
            totalUsers: userCount || 0,
            totalCards: totalCardCount, // RE-ADDED: Missing field fix
            totalEnquiries: supportStats.total,
            pendingReplies: supportStats.pending,
            todayActivity: finalizedActivity,
            lastRefresh: new Date().toLocaleTimeString()
        });
    } catch (err) {
        console.error('Admin Stats Error:', err);
        res.status(500).json({ error: 'Failed to aggregate administration statistics.' });
    }
});

// Endpoint to get all cards (Master Unified Registry: Local + Supabase)
app.get('/api/cards', async (req, res) => {
    try {
        const localCards = readCards();
        
        // Fetch manual registrations from Supabase
        const { data: manualCards, error } = await supabase
            .from('card_inventory')
            .select('*');

        if (error) {
            console.error('[DATABASE] Failed to fetch manual inventory for merge:', error);
            return res.json(localCards); // Fallback to local if DB fails
        }

        const formattedManual = (manualCards || []).map(m => ({
            id: m.id,
            name: m.name,
            set: m.set,
            rarity: m.rarity,
            priceEnglish: m.price_usd,
            image: m.image_url,
            type: m.type,
            isManual: true
        }));

        res.json([...localCards, ...formattedManual]);
    } catch (err) {
        console.error('Unified Cards Fetch Error:', err);
        res.json(readCards());
    }
});

// LIVE MARKET RATES — serves real-time price state with 60s volatility ticks
// Merges static card metadata with live in-memory market prices
app.get('/api/market-rates', async (req, res) => {
    try {
        const localCards = readCards();
        
        // Also fetch manual cards for market inclusion
        const { data: manualCards } = await supabase
            .from('card_inventory')
            .select('*');

        const formattedManual = (manualCards || []).map(m => ({
            id: m.id,
            name: m.name,
            set: m.set,
            rarity: m.rarity,
            priceEnglish: m.price_usd,
            image: m.image_url,
            type: m.type,
            isManual: true
        }));

        const allCards = [...localCards, ...formattedManual];

        if (!marketStateReady || Object.keys(marketState).length === 0) {
            return res.json({ ready: false, cards: allCards });
        }

        const liveCards = allCards.map(c => {
            const live = marketState[c.id];
            // For manual cards not in market engine yet, use their base price
            if (!live) return { ...c, percentChange: 0, priceDirection: 'neutral' };
            
            return {
                ...c,
                priceEnglish: live.priceEn,
                priceJapanese: live.priceJp,
                percentChange: live.change24h,
                volume: live.volume,
                priceDirection: live.priceEn > live.prevEn ? 'up' : live.priceEn < live.prevEn ? 'down' : 'neutral'
            };
        });
        res.json({ ready: true, lastTick: Date.now(), rates: liveCards });
    } catch (err) {
        console.error('Market Rates Hub Error:', err);
        res.status(500).json({ error: 'Market engine error' });
    }
});


// Endpoint to post a new card (Protected with Middleware)
app.post('/api/cards', authenticateAdmin, validateCard, (req, res) => {
    const newCard = req.body;
    const cards = readCards();
    cards.push(newCard);
    writeCards(cards);
    res.status(201).json(newCard);
});

// Proxy for Channel details with Caching
app.get('/api/youtube/channel', async (req, res) => {
    const now = Date.now();
    if (memoryYoutube.channel && (now - memoryYoutube.lastFetch.channel < YT_CACHE_DURATION)) {
        return res.json(memoryYoutube.channel);
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const response = await axios.get(url);
        
        memoryYoutube.channel = response.data;
        memoryYoutube.lastFetch.channel = now;
        
        // Async write to disk
        fs.writeFile(YOUTUBE_CACHE_FILE, JSON.stringify(memoryYoutube), () => {});
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching channel data:', error.message);
        // Fallback to memory if existing, else error
        if (memoryYoutube.channel) return res.json(memoryYoutube.channel);
        res.status(500).json({ error: 'Failed to fetch channel data' });
    }
});

// Proxy for Latest Videos with Caching
app.get('/api/youtube/videos', async (req, res) => {
    const now = Date.now();
    const uploadsPlaylistId = req.query.playlistId;
    if (!uploadsPlaylistId) return res.status(400).json({ error: 'Playlist ID required' });

    if (memoryYoutube.videos && (now - memoryYoutube.lastFetch.videos < YT_CACHE_DURATION)) {
         return res.json(memoryYoutube.videos);
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`;
        const response = await axios.get(url);
        
        memoryYoutube.videos = response.data;
        memoryYoutube.lastFetch.videos = now;
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching playlist items:', error.message);
        if (memoryYoutube.videos) return res.json(memoryYoutube.videos);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Proxy for Video Stats (Duration/Views) with Caching
app.get('/api/youtube/stats', async (req, res) => {
    const now = Date.now();
    const videoIds = req.query.ids;
    if (!videoIds) return res.status(400).json({ error: 'Video IDs required' });

    // Stats change more frequently, but we can still cache them for a bit
    if (memoryYoutube.stats && (now - memoryYoutube.lastFetch.stats < YT_CACHE_DURATION)) {
        return res.json(memoryYoutube.stats);
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
        const response = await axios.get(url);
        
        memoryYoutube.stats = response.data;
        memoryYoutube.lastFetch.stats = now;
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching video stats:', error.message);
        if (memoryYoutube.stats) return res.json(memoryYoutube.stats);
        res.status(500).json({ error: 'Failed to fetch video stats' });
    }
});

// Load YouTube Cache on startup
try {
    if (fs.existsSync(YOUTUBE_CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(YOUTUBE_CACHE_FILE, 'utf8'));
        memoryYoutube = data;
        console.log('[CACHE] Loaded YouTube data from disk');
    }
} catch (e) {
    console.warn('[CACHE] Failed to load YouTube cache');
}

app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// [AUTO] Background card sync (every 3 days)
setInterval(() => {
    console.log('[AUTO] Checking for card updates...');
    exec('node card_scraper.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`[SYNC ERROR] ${error.message}`);
            return;
        }
        console.log(`[SYNC] ${stdout.trim()}`);
    });
}, 3 * 24 * 60 * 60 * 1000); 

// --- SUPPORT TICKETING ENDPOINTS ---

// 1. Fetch Tickets (User gets their own, Admin gets all)
app.get('/api/support/tickets', authenticateAny, async (req, res) => {
    try {
        let query = supabase
            .from('support_tickets')
            .select(`
                *,
                users:user_id(name, email),
                support_messages (
                    *
                )
            `)
            .order('updated_at', { ascending: false });
        
        // If not admin, filter by user_id
        if (req.user.role !== 'admin') {
            query = query.eq('user_id', req.user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Map to match the frontend expectations
        const formatted = data.map(ticket => {
            // Sort messages within the ticket by creation date (Ascending - oldest first)
            const sortedMessages = (ticket.support_messages || []).sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
            );

            return {
                id: ticket.id,
                subject: ticket.subject,
                userName: ticket.users?.name || 'Anonymous User',
                userEmail: ticket.users?.email || 'N/A',
                message: sortedMessages[0]?.message || 'No message content available', 
                status: ticket.status,
                priority: ticket.priority,
                createdAt: ticket.created_at,
                updatedAt: ticket.updated_at,
                responses: sortedMessages.map(m => ({
                    id: m.id,
                    text: m.message,
                    adminName: m.is_admin ? (m.sender_name || 'Admin') : null,
                    userName: !m.is_admin ? (m.sender_name || ticket.users?.name || 'User') : null,
                    timestamp: m.created_at,
                    isUser: !m.is_admin
                }))
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('Support fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets.' });
    }
});

// 2. Create Ticket
app.post('/api/support/tickets', authenticateAny, async (req, res) => {
    let { subject, message, priority } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required to open a support ticket.' });
    }

    // Auto-generate subject if missing
    if (!subject || subject.trim() === '') {
        subject = message.length > 50 ? message.substring(0, 47) + '...' : message;
    }

    try {
        const { data: ticket, error: tError } = await supabase
            .from('support_tickets')
            .insert([{ user_id: req.user.id, subject, priority: priority || 'normal' }])
            .select()
            .single();

        if (tError) throw tError;

        // Add the initial message to messages thread (Include Role Badge)
        const { error: mError } = await supabase
            .from('support_messages')
            .insert([{ 
                ticket_id: ticket.id, 
                sender_id: req.user.id, 
                message: message.trim(), 
                is_admin: false
            }]);

        if (mError) {
            console.error('[DATABASE ERROR] Message insertion failed:', mError);
            throw mError;
        }
        res.json({ success: true, ticket });
    } catch (err) {
        console.error('Ticket creation error:', err);
        res.status(500).json({ error: 'Failed to create ticket.' });
    }
});

// 3. Add Reply to Ticket
app.post('/api/support/tickets/:id/messages', authenticateAny, async (req, res) => {
    const { message, is_admin: bodyIsAdmin } = req.body;
    const ticketId = req.params.id;
    // Explicit false from body (User sending via fallback) takes priority
    let isAdmin;
    if (bodyIsAdmin === false) {
        isAdmin = false; // User explicitly said NOT admin — trust it
    } else {
        isAdmin = req.user?.role === 'admin' || 
                  req.query.admin_secret === (process.env.ADMIN_SECRET || 'Op_masters@100') ||
                  bodyIsAdmin === true;
    }

    try {
        const { error: mError } = await supabase
            .from('support_messages')
            .insert([{ 
                ticket_id: ticketId, 
                sender_id: (req.user.id && req.user.id !== 'secret_admin') ? req.user.id : null, 
                message: message.trim(), 
                is_admin: isAdmin
            }]);

        if (mError) throw mError;

        // Update ticket's updated_at timestamp
        await supabase
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString(), status: isAdmin ? 'replied' : 'pending' })
            .eq('id', ticketId);

        res.json({ success: true });
    } catch (err) {
        console.error('Response error:', err);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// 4. Delete Ticket (Cascade)
app.delete('/api/support/tickets/:id', authenticateAny, async (req, res) => {
    const ticketId = req.params.id;
    try {
        // First delete all messages associated with this ticket
        const { error: mError } = await supabase
            .from('support_messages')
            .delete()
            .eq('ticket_id', ticketId);

        if (mError) throw mError;

        // Then delete the ticket itself
        const { error: tError } = await supabase
            .from('support_tickets')
            .delete()
            .eq('id', ticketId);

        if (tError) throw tError;

        res.json({ success: true, message: 'Ticket purged from database.' });
    } catch (err) {
        console.error('Delete ticket error:', err);
        res.status(500).json({ error: 'Failed to delete ticket.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Secure CORS`);
    
    // Background card sync (Doesn't block main loop)
    const runStartupSync = () => {
       exec('node card_scraper.js', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
           if (error) console.error(`[SYNC ERROR] ${error.message}`);
           else console.log(`[STARTUP SYNC] ${stdout.trim()}`);
       });
    };
    
    // Delay slightly to ensure server is fully ready
    setTimeout(runStartupSync, 5000);
    
    // Automate updates
    setInterval(runStartupSync, 3 * 24 * 60 * 60 * 1000); 

    // Automate news updates (every 4 hours)
    setInterval(async () => {
        try {
            console.log('[AUTO] Background news refresh started...');
            const freshNews = await fetchLatestNews();
            if (freshNews && freshNews.length > 0) {
                writeNewsCache(freshNews); 
                memoryNews = freshNews;
                lastFetchTime = Date.now();
                console.log(`[AUTO] Latest news updated (${freshNews.length} items).`);
            }
        } catch (err) {
            console.error('[ERROR] Background news refresh failed:', err.message);
        }
    }, 4 * 60 * 60 * 1000); 
});

// GLOBAL ERROR HANDLING: Prevent server from exiting on background task failures
process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error(`[SERVER CRITICAL] Uncaught Exception: ${err.message}`);
    console.error(err.stack);
});
