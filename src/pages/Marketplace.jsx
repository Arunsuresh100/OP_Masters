import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, ArrowUpRight, ShieldCheck, Zap, X, Plus, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';

const Marketplace = ({ currency }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSet, setSelectedSet] = useState('all');
  const [sortBy, setSortBy] = useState('id'); // 'id', 'price-low', 'price-high'
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Image Loader Component
  const ImageWithLoader = ({ src, alt, className }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Skeleton / Blur Placeholder */}
        <div 
            className={`absolute inset-0 bg-slate-800 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`}
        />
        
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
    );
  };

  React.useEffect(() => {
    let mounted = true;
    const fetchCards = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/cards');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (mounted) {
          if (data && data.cards) {
             setCards(data.cards);
          } else if (Array.isArray(data)) {
             setCards(data);
          } else {
             setCards([]);
          }
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        if (mounted) setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    // Add a small delay for the cinematic effect
    const timer = setTimeout(() => {
        fetchCards();
    }, 1500);

    return () => {
        mounted = false;
        clearTimeout(timer);
    };
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRarity, selectedColor, selectedSet, localSearch]);

  const COLORS = ['Red', 'Blue', 'Green', 'Purple', 'Black', 'Yellow'];
  const SETS = ['OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12', 'OP13'];

  const filteredListings = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = 
        card.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        card.id.toLowerCase().includes(localSearch.toLowerCase()) ||
        (card.character && card.character.toLowerCase().includes(localSearch.toLowerCase()));
      
      const matchesRarity = 
        selectedRarity === 'all' || 
        card.rarity === selectedRarity;

      const matchesColor = 
        selectedColor === 'all' || 
        (card.colors && card.colors.includes(selectedColor));

      const matchesSet = 
        selectedSet === 'all' || 
        card.set === selectedSet;

      return matchesSearch && matchesRarity && matchesColor && matchesSet;
    });
  }, [cards, localSearch, selectedRarity, selectedColor, selectedSet]);

  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [filteredListings, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const currentListings = sortedListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setLocalSearch('');
    setSelectedRarity('all');
    setSelectedColor('all');
    setSelectedSet('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm z-50">
        <div className="relative w-24 h-24 mb-8">
           <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin"></div>
           <div className="absolute inset-2 border-r-4 border-blue-500 rounded-full animate-spin reverse"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-2xl font-black text-white tracking-tighter animate-pulse">OP</span>
           </div>
        </div>
        <div className="text-blue-500 animate-pulse text-[10px] font-bold tracking-[0.5em] uppercase">
          Initializing Marketplace
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-40 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Secure Indian Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Find Your <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">Legendary</span> Pulls
          </h1>
          <p className="text-slate-400 text-sm font-medium max-w-xl">
            Browse the most comprehensive One Piece TCG database in India. From Common staples to Manga chases.
          </p>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-8">
           {/* Rarity Filter (Vertical) */}
           <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Rarity</h3>
              <div className="space-y-2">
                <button 
                    onClick={() => setSelectedRarity('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${selectedRarity === 'all' ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-white/5'}`}
                >
                    All Rarities
                </button>
                {RARITIES.map(r => (
                    <button 
                        key={r.id}
                        onClick={() => setSelectedRarity(r.code)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between group ${selectedRarity === r.code ? `bg-gradient-to-r ${r.gradient} text-white border-transparent shadow-lg shadow-amber-500/10` : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-white/5'}`}
                    >
                        <span>{r.code}</span>
                        {selectedRarity !== r.code && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                ))}
              </div>
           </div>

           {/* Other Filters */}
           <div className="rounded-2xl bg-slate-900 border border-white/5 p-5 space-y-6">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                        <button 
                            key={color}
                            onClick={() => setSelectedColor(selectedColor === color ? 'all' : color)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedColor === color ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-400 border-white/5'}`}
                        >
                            {color}
                        </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Set</label>
                    <div className="flex flex-wrap gap-2">
                        {SETS.map(set => (
                        <button 
                            key={set}
                            onClick={() => setSelectedSet(selectedSet === set ? 'all' : set)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedSet === set ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 text-slate-400 border-white/5'}`}
                        >
                            {set}
                        </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={resetFilters}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <X className="w-3 h-3" /> Reset Filters
                </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Bar: Search, Sort, View Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search by card name, ID, or character..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-xl"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
             </div>
             
             <div className="flex gap-2">
                <select 
                    className="bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer min-w-[140px]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="id">Card ID (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                        </div>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <div className="w-4 h-4 flex flex-col gap-0.5 justify-center">
                            <div className="h-[2px] w-full bg-current rounded-full"></div>
                            <div className="h-[2px] w-full bg-current rounded-full"></div>
                            <div className="h-[2px] w-full bg-current rounded-full"></div>
                        </div>
                    </button>
                </div>
             </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2/2.8] rounded-2xl bg-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : sortedListings.length > 0 ? (
            <>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentListings.map(card => {
                        const rarityInfo = RARITIES.find(r => r.code === card.rarity) || RARITIES[0];
                        return (
                            <div key={card.id} className="group relative bg-slate-900 rounded-2xl p-3 border border-white/5 hover:border-amber-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10">
                            {/* Image Container with Loader */}
                            <div className="aspect-[2.5/3.5] rounded-xl overflow-hidden mb-4 relative bg-slate-950">
                                {/* Trust Indicator for High Value */}
                                {(card.rarity === 'Manga' || card.rarity === 'SEC' || card.price > 100) && (
                                    <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-emerald-500/90 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-white" />
                                        <span className="text-[8px] font-black uppercase tracking-wider text-white">Verified</span>
                                    </div>
                                )}

                                <ImageWithLoader 
                                    src={card.image} 
                                    alt={card.name} 
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Rarity Tag Overlay */}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-xl`}>
                                <span className={`text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${rarityInfo.gradient} bg-clip-text text-transparent`}>
                                    {card.rarity}
                                </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-500">{card.id} • {card.set}</span>
                                        {/* Market Trend */}
                                        <div className={`flex items-center gap-1 text-[10px] font-bold ${card.marketTrend === 'up' ? 'text-emerald-400' : card.marketTrend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                                            {card.marketTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : card.marketTrend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                            {card.percentChange}%
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-400 transition-colors" title={card.name}>
                                        {card.name}
                                    </h3>
                                    
                                    {/* Market Stats */}
                                    <div className="grid grid-cols-2 gap-2 mt-2 p-2 rounded-lg bg-white/5 border border-white/5">
                                        <div className="space-y-0.5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Vol (24h)</div>
                                            <div className="text-[10px] font-mono font-bold text-slate-300">{card.volume || '-'}</div>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Last Sold</div>
                                            <div className="text-[10px] font-mono font-bold text-slate-300">
                                                {card.lastSoldPrice ? `$${formatPrice(card.lastSoldPrice, currency, USD_TO_INR)}` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 space-y-3">
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Lowest Ask</div>
                                            <div className="text-emerald-400 font-black font-mono text-lg leading-none">
                                                ${formatPrice(card.price, currency, USD_TO_INR)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Highest Bid</div>
                                            <div className="text-amber-500 font-bold font-mono text-xs leading-none">
                                                ${formatPrice(card.price * 0.85, currency, USD_TO_INR)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-1">
                                            Buy Now
                                        </button>
                                        <button className="py-2.5 rounded-xl bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-1">
                                            Place Bid
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5">
                                        <th className="py-4 px-6">Rank</th>
                                        <th className="py-4 px-6">Card Details</th>
                                        <th className="py-4 px-6 text-center">Rarity</th>
                                        <th className="py-4 px-6">Owner</th>
                                        <th className="py-4 px-6 text-right">Live Rate</th>
                                        <th className="py-4 px-6 text-right">24h Vol</th>
                                        <th className="py-4 px-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentListings.map((card, idx) => {
                                        const rank = (currentPage - 1) * itemsPerPage + idx + 1;
                                        const rarityInfo = RARITIES.find(r => r.code === card.rarity) || RARITIES[0];
                                        // Mock Owner
                                        const owners = ['Rahul_TCG', 'Mumbai_Cards', 'Ashish_Collects', 'Delhi_King', 'OP_Master_Ind', 'Bangalore_Deals', 'Kerala_Pirate'];
                                        const owner = owners[Math.floor(Math.random() * owners.length)];
                                        const isVerified = card.price > 50;

                                        return (
                                            <tr key={card.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-4 px-6 text-slate-500 font-mono text-xs">#{rank}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-14 rounded bg-slate-800 overflow-hidden relative flex-shrink-0">
                                                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">{card.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">{card.id} • {card.set}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/5 ${rarityInfo.textColor}`}>
                                                        {card.rarity}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                            {owner.substring(0, 1)}
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-300">
                                                            {owner}
                                                            {isVerified && <ShieldCheck className="w-3 h-3 text-emerald-500 inline ml-1" />}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="font-bold text-emerald-400 font-mono text-sm">
                                                        ${formatPrice(card.price, currency, USD_TO_INR)}
                                                    </div>
                                                    <div className={`text-[9px] font-bold flex items-center justify-end gap-1 ${card.marketTrend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {card.marketTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {card.percentChange}%
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right font-mono text-xs text-slate-400">
                                                    {card.volume || '-'}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                                                        Buy
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
                         <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                         >
                            Previous
                         </button>
                         
                         <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                  if (currentPage >= totalPages - 2) {
                                      p = totalPages - 4 + i;
                                  } else {
                                      p = currentPage - 2 + i;
                                  }
                                }
                                if (p < 1) p = 1;
                                
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                         </div>

                         <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                         >
                            Next
                         </button>
                    </div>
                )}
                
                <div className="text-center text-slate-500 text-[10px] font-mono mt-4">
                    Showing {currentListings.length} of {sortedListings.length} cards (Page {currentPage} of {totalPages})
                </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-center space-y-4">
               <Zap className="w-12 h-12 text-slate-700" />
              <div className="space-y-1">
                <h3 className="text-white font-bold">No cards found</h3>
                <p className="text-slate-500 text-xs">Try adjusting your filters or search terms.</p>
              </div>
              <button 
                onClick={resetFilters}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
