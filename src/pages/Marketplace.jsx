import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, DollarSign, X, ChevronRight, BarChart3, Clock, ArrowRightLeft, Wallet, AlertCircle, PlusCircle, HelpCircle, Zap } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';
import { useUser } from '../context/UserContext';
import ListingModal from '../components/ListingModal';
import BuyModal from '../components/BuyModal';

// --- Helper Components ---

// Card Image with Loading State
const CardImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  if (error) {
    return (
      <div className={className}>
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
          <AlertCircle className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      )}
      {/* Actual Image */}
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

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
        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
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
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
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

  const openTrade = (card) => { 
    if (!user) {
      openAuth('login');
      return;
    }
    setSelectedCard(card);
    setIsBuyModalOpen(true);
  };
  
  const handleOpenListing = () => { 
    if (!user) {
      openAuth('login'); 
    } else {
      setIsListingModalOpen(true); 
    }
  };

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
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} card={selectedCard} />
      <ListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} card={cards[0]} />
      
      {/* Market Ticker - REMOVED for better UX */}

      <div className="px-4 sm:px-6 max-w-7xl mx-auto mt-8">
         {/* Stats Section - User-Friendly Redesign */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 shadow-2xl relative overflow-hidden">
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

      {/* Search & Filter Bar - App-like Mobile Design */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto mt-6 mb-6">
        <div className="flex flex-col gap-3 p-3 md:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl">
             {/* Search Input */}
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search cards..." 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 md:py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder-slate-500" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
             </div>
             
             {/* Filter Pills + List Button */}
             <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
               <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:overflow-x-auto sm:scrollbar-hide">
                  {['all', 'gainers', 'losers', 'high'].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => { setActiveFilter(f); setCurrentPage(1); }} 
                        className={`w-full sm:w-auto px-1 py-3 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                          activeFilter === f 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30' 
                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        {f === 'all' ? '🔹 All' : f === 'gainers' ? '📈 Gainers' : f === 'losers' ? '📉 Losers' : '💎 Premium'}
                      </button>
                  ))}
               </div>
               <button 
                 onClick={handleOpenListing} 
                 className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 md:px-6 py-3 md:py-3 rounded-xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
               >
                 <PlusCircle className="w-4 h-4" /> 
                 <span>Sell Asset</span>
               </button>
             </div>
        </div>
      </div>

      {/* Listings - Hybrid Table/Card Layout */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
         {/* Desktop Table View */}
         <div className="hidden md:block bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-white/10">
                            <th className="py-5 px-6 font-bold">Card</th>
                            <th className="py-5 px-6 text-right">Price</th>
                            <th className="py-5 px-6 text-right">1h Change</th>
                            <th className="py-5 px-6 text-right hidden lg:table-cell">1m Change</th>
                            <th className="py-5 px-6 text-right">Trading Vol</th>
                            <th className="py-5 px-6 w-32">Week Trend</th>
                            <th className="py-5 px-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {currentListings.map((card, index) => (
                            <tr 
                                key={card.id} 
                                className="hover:bg-white/[0.03] transition-colors group opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <CardImage src={card.image} alt={card.name} className="w-10 h-14 rounded-lg bg-slate-800 overflow-hidden relative flex-shrink-0 border border-white/10 group-hover:border-amber-500/40 transition-all shadow-md" />
                                        <div>
                                            <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">{card.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 flex items-center gap-2"><span className="bg-white/5 px-1.5 py-0.5 rounded">{card.id}</span></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right"><div className="font-bold text-white font-mono text-sm">{formatPrice(card.price, currency, USD_TO_INR)}</div></td>
                                <td className="py-4 px-6 text-right">
                                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                      card.change1h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {card.change1h >= 0 ? '+' : ''}{card.change1h}%
                                        {card.change1h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right hidden lg:table-cell">
                                    <div className={`text-[10px] font-bold ${card.change1m >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                        {card.change1m >= 0 ? '+' : ''}{card.change1m}%
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right"><div className="font-mono text-xs text-slate-300">${card.volume.toLocaleString()}K</div></td>
                                <td className="py-4 px-6"><Sparkline data={card.trendData} color={card.change24h >= 0 ? '#10b981' : '#ef4444'} /></td>
                                <td className="py-4 px-6 text-right"><button onClick={() => openTrade(card)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-amber-400 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95">Buy</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Table Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-all text-xs font-bold">← Prev</button>
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-all text-xs font-bold">Next →</button>
                    </div>
                </div>
            )}
         </div>
         
         {/* Mobile Card View */}
         <div className="md:hidden space-y-3">
            {currentListings.map((card, index) => (
              <div 
                key={card.id} 
                className="bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-amber-500/30 transition-all opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header */}
                <div className="p-4 flex items-start gap-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  <CardImage src={card.image} alt={card.name} className="w-16 h-22 rounded-xl bg-slate-800 overflow-hidden border border-white/10 shadow-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-base line-clamp-1 mb-1">{card.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded inline-block">{card.id}</div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
                    card.change1h >= 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {card.change1h >= 0 ? '+' : ''}{card.change1h}%
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Price */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Price</span>
                    <span className="text-xl font-black text-white font-mono">{formatPrice(card.price, currency, USD_TO_INR)}</span>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Volume</div>
                      <div className="text-sm font-bold text-slate-200 font-mono">${card.volume.toLocaleString()}K</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Trend</div>
                      <div className="flex items-center">
                        <Sparkline data={card.trendData} color={card.change24h >= 0 ? '#10b981' : '#ef4444'} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Trade Button */}
                  <button 
                    onClick={() => openTrade(card)} 
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-black uppercase tracking-wider hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] mt-2"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
            
            {/* Mobile Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2">
                    <span className="text-xs font-bold text-slate-400">Page {currentPage}/{totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                          disabled={currentPage === 1} 
                          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-all text-sm font-bold active:scale-95"
                        >
                          ←
                        </button>
                        <button 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                          disabled={currentPage === totalPages} 
                          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-all text-sm font-bold active:scale-95"
                        >
                          →
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default Marketplace;
