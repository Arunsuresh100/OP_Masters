import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, DollarSign, X, ChevronRight, BarChart3, Clock, ArrowRightLeft, Wallet, AlertCircle, PlusCircle, HelpCircle, Zap } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';
import { useUser } from '../context/UserContext';
import ListingModal from '../components/ListingModal';

// --- Helper Components ---

const Sparkline = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 100;
  const step = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const MarketTicker = ({ items }) => {
  return (
    <div className="w-full bg-slate-950/40 backdrop-blur-md border-y border-white/5 overflow-hidden py-3 flex items-center group relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
      
      <div className="flex animate-[scroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-12 whitespace-nowrap px-10">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:border-amber-500/30 transition-all cursor-default">
            <span className="text-slate-400 font-black text-[10px] tracking-tighter uppercase">{item.pair}</span>
            <span className="text-white font-mono text-sm font-bold">
              ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 text-xs font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(item.change)}%
            </div>
            <div className="w-8 h-4 opacity-50">
              <Sparkline data={item.trendData || [10, 12, 11, 14, 13, 16, 15]} color={item.change >= 0 ? '#10b981' : '#ef4444'} />
            </div>
          </div>
        ))}
         {items.map((item, idx) => (
          <div key={`dup-${idx}`} className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:border-amber-500/30 transition-all cursor-default">
            <span className="text-slate-400 font-black text-[10px] tracking-tighter uppercase">{item.pair}</span>
            <span className="text-white font-mono text-sm font-bold">
              ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 text-xs font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(item.change)}%
            </div>
             <div className="w-8 h-4 opacity-50">
              <Sparkline data={item.trendData || [10, 12, 11, 14, 13, 16, 15]} color={item.change >= 0 ? '#10b981' : '#ef4444'} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const TradeModal = ({ card, isOpen, onClose, currency }) => {
  const [tradeType, setTradeType] = useState('buy');
  const [price, setPrice] = useState(card?.price || 0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
       setPrice(card.price);
       setQuantity(1);
       setSuccess(false);
       setTradeType('buy');
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  const total = price * quantity;
  const fee = total * 0.02;
  const finalTotal = tradeType === 'buy' ? total + fee : total - fee;

  const handleTrade = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                Trade {card.name}
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-950/50 border-b border-white/5">
            <button onClick={() => setTradeType('buy')} className={`py-3 text-sm font-black uppercase tracking-widest transition-all ${tradeType === 'buy' ? 'bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}>Buy</button>
            <button onClick={() => setTradeType('sell')} className={`py-3 text-sm font-black uppercase tracking-widest transition-all ${tradeType === 'sell' ? 'bg-red-500/10 text-red-500 border-b-2 border-red-500' : 'text-slate-500 hover:text-slate-300'}`}>Sell</button>
        </div>

        <div className="p-6 space-y-6">
            {success ? (
                <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce"><Wallet className="w-8 h-8" /></div>
                    <h4 className="text-xl font-black text-white">Order Filled!</h4>
                    <p className="text-slate-400 text-sm">Successfully {tradeType === 'buy' ? 'bought' : 'sold'} {quantity}x {card.name}.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                        <img src={card.image} alt={card.name} className="w-10 h-14 object-cover rounded bg-slate-800" />
                        <div>
                            <div className="text-sm font-bold text-white line-clamp-1">{card.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{card.id} • {card.set}</div>
                        </div>
                        <div className="ml-auto text-right">
                             <div className="text-[10px] text-slate-500 uppercase font-bold">Market Price</div>
                             <div className="text-sm font-mono font-bold text-amber-500">${formatPrice(card.price, currency, USD_TO_INR)}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price ({currency})</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-amber-500/50 transition-all" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold focus:outline-none focus:border-amber-500/50 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/5">
                         <div className="flex justify-between text-xs text-slate-400"><span>Subtotal</span><span className="font-mono">${formatPrice(total, currency, USD_TO_INR)}</span></div>
                         <div className="flex justify-between text-xs text-slate-400"><span>Fee (2%)</span><span className="font-mono">${formatPrice(fee, currency, USD_TO_INR)}</span></div>
                         <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5"><span>Total</span><span className="font-mono text-amber-400">${formatPrice(finalTotal, currency, USD_TO_INR)}</span></div>
                    </div>

                    <button onClick={handleTrade} disabled={loading} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${tradeType === 'buy' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' : 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]'} ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                        {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${card.name}`}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

const Marketplace = ({ currency }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const { user, openAuth } = useUser();
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/cards');
        const data = await res.json();
        let rawCards = data?.cards || (Array.isArray(data) ? data : []);
        const augmentedCards = rawCards.map(card => {
            const price = Number(card.price) || 0;
            const change24h = card.percentChange !== undefined ? Number(card.percentChange) : (Math.random() * 4 - 2);
            // Simulate granular changes
            const change1h = Number((change24h / 24 + (Math.random() * 0.2 - 0.1)).toFixed(2));
            const change1m = Number((change1h / 60 + (Math.random() * 0.05 - 0.025)).toFixed(3));
            
            const volume = card.volume || Math.floor(Math.random() * 500) + 50;
            const marketCap = volume * price * 1000;
            const baseTrend = Array.from({ length: 7 }, (_, i) => price * (1 + (i / 7) * (change24h / 100) + (Math.random() * 0.02 - 0.01)));
            
            return { 
                ...card, 
                price, 
                change24h: Number(change24h.toFixed(2)), 
                change1h,
                change1m,
                volume, 
                marketCap, 
                trendData: baseTrend 
            };
        });
        setCards(augmentedCards.sort((a,b) => b.price - a.price));
      } catch (err) { console.error("Fetch failed", err); } finally { setLoading(false); }
    };
    fetchCards();
  }, []);

  const openTrade = (card) => { setSelectedCard(card); setTradeModalOpen(true); };
  const handleOpenListing = () => { if (!user) openAuth('login'); else setIsListingModalOpen(true); };

  const filteredCards = useMemo(() => {
    let result = cards.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeFilter === 'gainers') result = result.filter(c => c.change24h > 0).sort((a,b) => b.change24h - a.change24h);
    else if (activeFilter === 'losers') result = result.filter(c => c.change24h < 0).sort((a,b) => a.change24h - b.change24h);
    else if (activeFilter === 'high') result = [...result].sort((a,b) => b.price - a.price);
    return result;
  }, [cards, searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const currentListings = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tickerItems = useMemo(() => {
      if (cards.length === 0) return [];
      return [...cards].sort((a,b) => b.change24h - a.change24h).slice(0, 5).concat([...cards].sort((a,b) => a.change24h - b.change24h).slice(0, 5)).map(c => ({ pair: `${c.id}/USD`, price: c.price, change: c.change24h, trendData: c.trendData }));
  }, [cards]);

  const marketStats = useMemo(() => {
    if (cards.length === 0) return { volume: 0, cap: 0, topGainer: null };
    const volume = cards.reduce((sum, c) => sum + (c.volume * c.price), 0);
    const cap = cards.reduce((sum, c) => sum + (c.marketCap || 0), 0);
    const topGainer = [...cards].sort((a,b) => b.change24h - a.change24h)[0];
    return { volume, cap, topGainer };
  }, [cards]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm z-50">
        <div className="relative w-24 h-24 mb-8">
           <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin"></div>
           <div className="absolute inset-4 border-r-4 border-blue-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
           <div className="absolute inset-8 border-b-4 border-emerald-500 rounded-full animate-spin [animation-duration:2s]"></div>
        </div>
        <div className="text-amber-500 animate-pulse text-[10px] font-bold tracking-[0.5em] uppercase">Connecting Exchange</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-40 bg-slate-950 font-sans text-slate-200">
      <ListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} card={cards[0]} />
      
      {/* Market Ticker - REMOVED for better UX */}

      <div className="px-4 sm:px-6 max-w-7xl mx-auto mt-8">
         {/* Stats Section - User-Friendly Redesign */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
             
             {/* Today's Sales (was 24H VOL) */}
             <div className="space-y-1 relative z-10 bg-slate-800/30 p-3 md:p-4 rounded-xl border-l-2 border-amber-500/30 hover:border-amber-500 transition-all group">
                 <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                   <Activity className="w-3 h-3 md:w-4 md:h-4 text-amber-500" /> 
                   <span className="hidden sm:inline">Today's Sales</span>
                   <span className="sm:hidden">Sales</span>
                   <div className="relative group/tooltip">
                     <HelpCircle className="w-3 h-3 text-slate-500 opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-opacity z-50">
                       Total trading value in last 24 hours
                       <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                     </div>
                   </div>
                 </div>
                 <div className="text-lg md:text-2xl font-black text-white">${(marketStats.volume / 1000).toFixed(1)}K</div>
                 <div className="text-[9px] md:text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                   <ArrowUpRight className="w-3 h-3" /> +12.5%
                 </div>
             </div>
             
             {/* Total Market Value (was CAP) */}
             <div className="space-y-1 relative z-10 bg-slate-800/30 p-3 md:p-4 rounded-xl border-l-2 border-blue-500/30 hover:border-blue-500 transition-all group">
                 <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                   <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-blue-500" /> 
                   <span className="hidden sm:inline">Total Value</span>
                   <span className="sm:hidden">Value</span>
                   <div className="relative group/tooltip">
                     <HelpCircle className="w-3 h-3 text-slate-500 opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-opacity z-50">
                       Combined value of all listed cards
                       <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                     </div>
                   </div>
                 </div>
                 <div className="text-lg md:text-2xl font-black text-white">${(marketStats.cap / 1000000).toFixed(1)}M</div>
                 <div className="text-[9px] md:text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                   <ArrowUpRight className="w-3 h-3" /> +3.2%
                 </div>
             </div>
             
             {/* Trending Now (was TOP PERFORMER) */}
             <div className="hidden md:block space-y-1 relative z-10 bg-slate-800/30 p-4 rounded-xl border-l-2 border-emerald-500/30 hover:border-emerald-500 transition-all group">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Zap className="w-4 h-4 text-emerald-500" /> 
                   🔥 Trending Now
                   <div className="relative group/tooltip">
                     <HelpCircle className="w-3 h-3 text-slate-500 opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-opacity z-50">
                       Most popular card right now
                       <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                     </div>
                   </div>
                 </div>
                 <div className="text-2xl font-black text-emerald-400">{marketStats.topGainer?.id || '---'}</div>
                 <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> +{marketStats.topGainer?.change1h || 0}%
                 </div>
             </div>
             
             {/* Updates Every (was NEXT LISTING UPDATE) */}
             <div className="hidden md:block space-y-1 relative z-10 bg-slate-800/30 p-4 rounded-xl border-l-2 border-purple-500/30 hover:border-purple-500 transition-all group">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Clock className="w-4 h-4 text-purple-500" /> 
                   Updates Every
                 </div>
                 <div className="text-2xl font-black text-white">5 min</div>
                 <div className="text-[10px] text-purple-400 font-bold">Real-time pricing</div>
             </div>
         </div>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto mt-8 mb-6 sticky top-20 z-40">
        <div className="flex flex-col md:flex-row gap-4 p-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/5 shadow-xl">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search market pairs..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder-slate-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex flex-wrap gap-1 p-1 bg-slate-950/50 rounded-xl border border-white/5">
                {['all', 'gainers', 'losers', 'high'].map((f) => (
                    <button key={f} onClick={() => { setActiveFilter(f); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{f === 'all' ? 'All Assets' : f === 'gainers' ? 'Top Gainers' : f === 'losers' ? 'Top Losers' : 'Highest Value'}</button>
                ))}
             </div>
             <button onClick={handleOpenListing} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"><PlusCircle className="w-4 h-4" /> List Asset</button>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
         <div className="bg-slate-900 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/30 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5">
                            <th className="py-5 px-6 font-bold">Card</th>
                            <th className="py-5 px-6 text-right">Price</th>
                            <th className="py-5 px-6 text-right">1h Change</th>
                            <th className="py-5 px-6 text-right hidden lg:table-cell">1m Change</th>
                            <th className="py-5 px-6 text-right hidden md:table-cell">Trading Vol</th>
                            <th className="py-5 px-6 hidden md:table-cell w-32">Week Trend</th>
                            <th className="py-5 px-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {currentListings.map((card) => (
                            <tr key={card.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-14 rounded bg-slate-800 overflow-hidden relative flex-shrink-0 border border-white/5 group-hover:border-amber-500/30 transition-all"><img src={card.image} alt={card.name} className="w-full h-full object-cover" /></div>
                                        <div>
                                            <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">{card.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 flex items-center gap-2"><span className="bg-white/5 px-1.5 py-0.5 rounded">{card.id}</span></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right"><div className="font-bold text-white font-mono text-sm">{formatPrice(card.price, currency, USD_TO_INR)}</div></td>
                                <td className="py-4 px-6 text-right">
                                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-tighter ${card.change1h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {card.change1h >= 0 ? '+' : ''}{card.change1h}%
                                        {card.change1h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right hidden lg:table-cell">
                                    <div className={`text-[10px] font-bold ${card.change1m >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                        {card.change1m >= 0 ? '+' : ''}{card.change1m}%
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right hidden md:table-cell"><div className="font-mono text-xs text-slate-300">${card.volume.toLocaleString()}K</div></td>
                                <td className="py-4 px-6 hidden md:table-cell"><Sparkline data={card.trendData} color={card.change24h >= 0 ? '#10b981' : '#ef4444'} /></td>
                                <td className="py-4 px-6 text-right"><button onClick={() => openTrade(card)} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all">Trade</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-6 py-6 border-t border-white/5 flex items-center justify-between bg-slate-950/30">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"><ArrowRightLeft className="w-4 h-4 rotate-180" /></button>
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"><ArrowRightLeft className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
         </div>
      </div>

      <TradeModal card={selectedCard} isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} currency={currency} />
    </div>
  );
};

export default Marketplace;
