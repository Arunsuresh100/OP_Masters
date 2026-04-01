import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, DollarSign, X, ChevronRight, BarChart3, Clock, ArrowRightLeft, Wallet, AlertCircle, PlusCircle, HelpCircle, Zap, Info, SlidersHorizontal, Globe, Coins, Diamond, ShoppingCart, Tag, Heart } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';
import { useUser } from '../context/UserContext';
import ListingModal from '../components/ListingModal';
import BuyModal from '../components/BuyModal';

// --- Professional Helper Components ---

const getCardImageUrl = (url) => {
  if (!url) return '';
  return `${import.meta.env.VITE_API_URL}/api/card-image?url=${encodeURIComponent(url)}`;
};

const CardImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    const img = new Image();
    img.src = getCardImageUrl(src);
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  if (error) {
    return (
      <div className={className}>
        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700 text-xs rounded-lg border border-white/5">
          <AlertCircle className="w-4 h-4 opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}
      <img 
        src={getCardImageUrl(src)} 
        alt={alt} 
        className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

const Sparkline = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 70;
  const step = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-30 group-hover:opacity-70 transition-opacity">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const MarketplaceDetailModal = ({ isOpen, onClose, card, currency, marketLocale, onBuy, onSell }) => {
  const { wishlist, toggleWishlist } = useUser();
  const isWishlisted = card ? wishlist.includes(card.id) : false;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!card) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose} />
      <div className={`relative w-full max-w-[95%] md:max-w-2xl bg-slate-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} max-h-[85vh] flex flex-col`}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 bg-white/5 hover:bg-white text-white hover:text-slate-950 rounded-full transition-all active:scale-95 shadow-xl border border-white/10"><X className="w-5 h-5" /></button>
        <div className="flex flex-col sm:flex-row h-full overflow-y-auto no-scrollbar">
          <div className="w-full sm:w-[45%] bg-black/40 p-6 sm:p-10 flex flex-col items-center justify-center relative border-b sm:border-b-0 sm:border-r border-white/5 shrink-0">
             <CardImage src={card.image} alt={card.name} className="w-full max-w-[150px] sm:max-w-[200px] aspect-[1/1.4] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-700" />
             <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3">
                <div className="px-4 sm:px-5 py-1.5 bg-white text-slate-950 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-none">{card.rarity}</div>
                <div className="px-4 sm:px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Exp: {card.set}</div>
             </div>
          </div>
          <div className="w-full sm:w-[57%] p-6 sm:p-8 flex flex-col relative z-10">
             <div className="mb-4 sm:mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                   <Activity className="w-3 h-3 text-emerald-500" />
                   <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Live Market Data</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight uppercase">{card.name}</h2>
                <div className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">{card.id}</div>
             </div>

             <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 border-t border-white/5 pt-4 sm:pt-6">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Asset Value</div>
                        <div className="text-xl sm:text-2xl font-medium text-white font-mono leading-none tracking-tight">
                            {formatPrice(marketLocale === 'EN' ? card.priceEnglish : card.priceJapanese, currency, USD_TO_INR)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">24h Change</div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${card.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {card.change24h >= 0 ? '+' : ''}{card.change24h}%
                            {card.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-6">
                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5">
                        <div className="text-center px-1">
                            <div className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">1 Hour</div>
                            <div className={`text-[10px] font-medium font-mono ${card.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{card.change1h >= 0 ? '+' : ''}{card.change1h}%</div>
                        </div>
                        <div className="text-center px-1 border-x border-white/5">
                            <div className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">1 Month</div>
                            <div className={`text-[10px] font-medium font-mono ${card.change1m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{card.change1m >= 0 ? '+' : ''}{card.change1m}%</div>
                        </div>
                        <div className="text-center px-1">
                            <div className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Volume</div>
                            <div className="text-[10px] font-medium text-white font-mono italic whitespace-nowrap">${(card.volume || 0)}K</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => toggleWishlist(card.id)}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 border ${
                            isWishlisted 
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                                : 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-950'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        </span>
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Marketplace = ({ currency, setCurrency, searchQuery, marketLocale, setMarketLocale }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  useEffect(() => { setSearchTerm(searchQuery || ''); }, [searchQuery]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Trade Modal States
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [activeTradeCard, setActiveTradeCard] = useState(null);

  const { user, openAuth } = useUser();
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cards`);
        const data = await res.json();
        let rawCards = data?.cards || (Array.isArray(data) ? data : []);
        const augmentedCards = rawCards.map(card => {
            const price = marketLocale === 'EN' ? (Number(card.priceEnglish) || 0) : (Number(card.priceJapanese) || 0);
            const change24h = card.percentChange !== undefined ? Number(card.percentChange) : (Math.random() * 4 - 2);
            const change1h = Number((change24h / 24 + (Math.random() * 0.2 - 0.1)).toFixed(2));
            const change1m = Number((change1h / 60 + (Math.random() * 0.05 - 0.025)).toFixed(3));
            const volume = card.volume || Math.floor(Math.random() * 500) + 50;
            const marketCap = volume * price * 1000;
            const baseTrend = Array.from({ length: 7 }, (_, i) => price * (1 + (i / 7) * (change24h / 100) + (Math.random() * 0.02 - 0.01)));
            return { ...card, price, change24h: Number(change24h.toFixed(2)), change1h, change1m, volume, marketCap, trendData: baseTrend };
        });
        setCards(augmentedCards.sort((a,b) => (marketLocale === 'EN' ? b.priceEnglish : b.priceJapanese) - (marketLocale === 'EN' ? a.priceEnglish : a.priceJapanese)));
      } catch (err) { console.error("Market fetch error", err); } finally { setLoading(false); }
    };
    fetchCards();
  }, [marketLocale]);

  const filteredCards = useMemo(() => {
    let result = cards.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeFilter === 'gainers') result = result.filter(c => c.change24h > 0).sort((a,b) => b.change24h - a.change24h);
    else if (activeFilter === 'losers') result = result.filter(c => c.change24h < 0).sort((a,b) => a.change24h - b.change24h);
    else if (activeFilter === 'high') result = [...result].sort((a,b) => (marketLocale === 'EN' ? b.priceEnglish : b.priceJapanese) - (marketLocale === 'EN' ? a.priceEnglish : a.priceJapanese));
    return result;
  }, [cards, searchTerm, activeFilter, marketLocale]);

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const currentListings = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;
    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        if (i < totalPages && i > 1) range.push(i);
    }
    if (totalPages > 1) range.push(totalPages);
    for (let i of range) {
        if (l) {
            if (i - l === 2) rangeWithDots.push(l + 1);
            else if (i - l !== 1) rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
  };

  const marketStats = useMemo(() => {
    if (cards.length === 0) return { volume: 0, cap: 0, topGainer: null };
    const volume = cards.reduce((sum, c) => sum + (c.volume * c.price), 0);
    const cap = cards.reduce((sum, c) => sum + (c.marketCap || 0), 0);
    const topGainer = [...cards].sort((a,b) => b.change24h - a.change24h)[0];
    return { volume, cap, topGainer };
  }, [cards]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-2 border-white/5 border-t-amber-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]"></div>
        <div className="text-white text-[10px] font-bold tracking-[0.3em] uppercase italic opacity-40">Refreshing Market Live Data</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-200">
      <MarketplaceDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        card={selectedCard} 
        currency={currency} 
        marketLocale={marketLocale} 
        onBuy={(card) => { setActiveTradeCard(card); setIsBuyModalOpen(true); }}
        onSell={(card) => { setActiveTradeCard(card); setIsSellModalOpen(true); }}
      />

      <BuyModal 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
        card={activeTradeCard} 
      />

      <ListingModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)} 
        card={activeTradeCard} 
      />
      
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
         {/* App-Style Compact Stats Bar */}
         <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
             <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-white/5 shadow-lg">
                <div className="flex items-center gap-1.5 mb-1 opacity-40">
                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">24h Sales</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-white tabular-nums tracking-tight">${(marketStats.volume / 1000).toFixed(1)}K</div>
             </div>

             <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-white/5 shadow-lg">
                <div className="flex items-center gap-1.5 mb-1 opacity-40">
                    <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Global Value</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-white tabular-nums tracking-tight">${(marketStats.cap / 1000000).toFixed(1)}M</div>
             </div>

             <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-white/5 shadow-lg">
                <div className="flex items-center gap-1.5 mb-1 opacity-40">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Market</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-white tracking-tight uppercase">Bullish</div>
             </div>

             <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-white/5 shadow-lg">
                <div className="flex items-center gap-1.5 mb-1 opacity-40">
                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap whitespace-nowrap">Top</span>
                </div>
                <div className="text-base sm:text-xl font-bold text-emerald-400 truncate leading-none tracking-tight">{marketStats.topGainer?.id || '---'}</div>
             </div>
         </div>

         {/* Compact Unified Header Box */}
         <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-white/5 shadow-xl space-y-4 sm:space-y-6">
              {/* Desktop/Tablet: Search + Toggles in one row | Mobile: Stacked */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                  {/* Search */}
                  <div className="relative group flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                     <input 
                        type="text" placeholder="Search Card name or ID..." value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 sm:py-3.5 pl-11 pr-5 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-bold placeholder-slate-700" 
                     />
                  </div>

                  {/* Toggles Container (Aligned Right on Desktop) */}
                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 flex-shrink-0">
                     {/* Locale Toggle */}
                     <div className="flex p-0.5 bg-black border border-white/10 rounded-lg relative overflow-hidden h-9 w-full lg:w-32 shadow-inner">
                        <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] bg-white rounded-md transition-all duration-300 ${marketLocale === 'EN' ? 'translate-x-0' : 'translate-x-full'}`} />
                        <button onClick={() => setMarketLocale('EN')} className={`relative z-10 flex-1 flex items-center justify-center text-[9px] font-bold transition-all ${marketLocale === 'EN' ? 'text-slate-950' : 'text-slate-500 hover:text-white'}`}>GLOBAL</button>
                        <button onClick={() => setMarketLocale('JP')} className={`relative z-10 flex-1 flex items-center justify-center text-[9px] font-bold transition-all ${marketLocale === 'JP' ? 'text-slate-950' : 'text-slate-500 hover:text-white'}`}>LOCAL</button>
                     </div>
                     {/* Currency Toggle */}
                     <div className="flex p-0.5 bg-black border border-white/10 rounded-lg relative overflow-hidden h-9 w-full lg:w-32 shadow-inner">
                        <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] bg-gradient-to-r from-amber-400 to-orange-500 rounded-md transition-all duration-300 ${currency === 'USD' ? 'translate-x-0' : 'translate-x-full'}`} />
                        <button onClick={() => setCurrency('USD')} className={`relative z-10 flex-1 flex items-center justify-center text-[9px] font-bold transition-all ${currency === 'USD' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>USD ($)</button>
                        <button onClick={() => setCurrency('INR')} className={`relative z-10 flex-1 flex items-center justify-center text-[9px] font-bold transition-all ${currency === 'INR' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>INR (₹)</button>
                     </div>
                  </div>
              </div>
              
              {/* Filter Chips - Clean row below */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                 {['all', 'gainers', 'losers', 'high'].map((f) => (
                    <button 
                        key={f} onClick={() => { setActiveFilter(f); setCurrentPage(1); }} 
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all border border-transparent whitespace-nowrap flex items-center gap-2 ${activeFilter === f ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-black/40 text-slate-400 hover:text-white'}`}
                    >
                      {f === 'all' ? <span>🔍 All</span> : f === 'gainers' ? <span>🚀 Gainers</span> : f === 'losers' ? <span>🔻 Losers</span> : <span>💎 Premium</span>}
                    </button>
                 ))}
              </div>
         </div>

         {/* Professional Asset Index Section */}
         <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/20 text-[10px] uppercase font-bold tracking-widest text-slate-600 border-b border-white/5">
                            <th className="py-6 px-10">Card</th>
                            <th className="py-6 px-8 text-right">Price</th>
                            <th className="py-6 px-8 text-right">1h Change</th>
                            <th className="py-6 px-8 text-right">1m Change</th>
                            <th className="py-6 px-8 text-right">Trading Vol</th>
                            <th className="py-6 px-10 w-44">Week Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {currentListings.map((card, index) => (
                            <tr 
                                key={card.id} onClick={() => { setSelectedCard(card); setIsDetailModalOpen(true); }} 
                                className="group hover:bg-white/[0.02] transition-all cursor-pointer animate-in fade-in" 
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <td className="py-4 px-10">
                                    <div className="flex items-center gap-5">
                                        <CardImage src={card.image} alt={card.name} className="w-12 h-16 rounded-xl bg-black border border-white/5 group-hover:scale-105 transition-all shadow-lg" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-white text-sm uppercase leading-tight mb-1 group-hover:text-amber-400 transition-colors">{card.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">{card.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <div className="text-base font-bold text-white font-mono tracking-tighter leading-none group-hover:text-white transition-colors">
                                        {formatPrice(marketLocale === 'EN' ? card.priceEnglish : card.priceJapanese, currency, USD_TO_INR)}
                                    </div>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${card.change1h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {card.change1h >= 0 ? '+' : ''}{card.change1h}%
                                        {card.change1h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    </div>
                                </td>
                                <td className="py-4 px-8 text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${card.change1m >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {card.change1m >= 0 ? '+' : ''}{card.change1m}%
                                    </div>
                                </td>
                                <td className="py-4 px-8 text-right font-bold font-mono text-slate-500 text-sm italic opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap">${(card.volume).toLocaleString()}K</td>
                                <td className="py-4 px-10"><Sparkline data={card.trendData} color={card.change24h >= 0 ? '#10b981' : '#f43f5e'} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {currentListings.length === 0 && (
                    <div className="py-32 text-center text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em]">No matching market assets</div>
                )}
            </div>

            {/* Native App Style Mobile Feed */}
            <div className="md:hidden divide-y divide-white/5">
                {currentListings.map((card, index) => (
                  <div 
                    key={card.id} onClick={() => { setSelectedCard(card); setIsDetailModalOpen(true); }} 
                    className="p-4 flex items-center gap-4 active:bg-white/5 transition-all animate-in fade-in"
                  >
                      <CardImage src={card.image} alt={card.name} className="w-16 h-22 rounded-xl bg-black border border-white/5 shadow-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm uppercase leading-none mb-1.5 truncate">{card.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono font-bold mb-3 uppercase tracking-wider">{card.id}</div>
                          <div className="flex flex-wrap items-center gap-2">
                             <div className={`px-2 py-1 rounded-lg text-[9px] font-bold ${card.change1h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                 1h: {card.change1h >= 0 ? '+' : ''}{card.change1h}%
                             </div>
                             <div className={`px-2 py-1 rounded-lg text-[9px] font-bold ${card.change1m >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                 1m: {card.change1m >= 0 ? '+' : ''}{card.change1m}%
                             </div>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 px-1 flex-shrink-0">
                          <div className="text-base font-bold text-white font-mono leading-none tracking-tighter">
                            {formatPrice(marketLocale === 'EN' ? card.priceEnglish : card.priceJapanese, currency, USD_TO_INR)}
                          </div>
                          <div className="scale-90 origin-right opacity-30"><Sparkline data={card.trendData} color={card.change24h >= 0 ? '#10b981' : '#f43f5e'} /></div>
                      </div>
                  </div>
                ))}
            </div>

            {/* Unified Compact Pagination */}
            {totalPages > 1 && (
                <div className="p-6 border-t border-white/5 bg-black/10 flex flex-wrap justify-center items-center gap-1.5">
                    <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                        disabled={currentPage === 1}
                        className={`px-4 py-2.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${currentPage === 1 ? 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed' : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white active:scale-95'}`}
                    >
                        Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all ${page === currentPage ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : page === '...' ? 'bg-transparent border-transparent text-slate-600 cursor-default' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/10 hover:text-white active:scale-95'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${currentPage === totalPages ? 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed' : 'bg-slate-800 border-white/10 text-white hover:bg-white/5 active:scale-95'}`}
                    >
                        Next
                    </button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Marketplace;
