import React, { useState, useEffect } from 'react';
import { Search, Upload, X, Info, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Package, CheckCircle2 } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';
import { useUser } from '../context/UserContext';

const Cards = ({ currency, setCurrency, searchQuery, marketLocale, setMarketLocale }) => {
  const { ownedCards, toggleOwnedCard } = useUser();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  
  useEffect(() => {
    setSearchTerm(searchQuery || '');
  }, [searchQuery]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Filters
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedSet, setSelectedSet] = useState('all');

  // Scroll Indicators Logic
  const filterScrollRef = React.useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (filterScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = filterScrollRef.current;
    if (el) {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [cards]);

  const SETS = [
    { id: 'all', name: 'ALL COLLECTIONS' },
    { id: 'OP15', name: 'OP15 - Adventure on Kami’s Island' },
    { id: 'OP14', name: 'OP14 - The Azure Sea’s Seven' },
    { id: 'OP13', name: 'OP13 - Carrying on His Will' },
    { id: 'OP12', name: 'OP12 - Legacy of the Master' },
    { id: 'OP11', name: 'OP11 - A Fist of Divine Speed' },
    { id: 'OP10', name: 'OP10 - Royal Blood' },
    { id: 'OP09', name: 'OP09 - Emperors in the New World' },
    { id: 'OP08', name: 'OP08 - Two Legends' },
    { id: 'OP07', name: 'OP07 - 500 Years into the Future' },
    { id: 'OP06', name: 'OP06 - Wings of the Captain' },
    { id: 'OP05', name: 'OP05 - Awakening of the New Era' },
    { id: 'OP04', name: 'OP04 - Kingdoms of Intrigue' },
    { id: 'OP03', name: 'OP03 - Pillars of Strength' },
    { id: 'OP02', name: 'OP02 - Paramount War' },
    { id: 'OP01', name: 'OP01 - Romance Dawn' },
    { id: 'EB03', name: 'EB03 - Extra Booster Heroines' },
    { id: 'EB02', name: 'EB02 - Extra Booster Anime 25th' },
    { id: 'EB01', name: 'EB01 - Extra Booster Memorial' },
    { id: 'PRB02', name: 'PRB02 - Premium Booster vol.2' },
    { id: 'PRB01', name: 'PRB01 - Premium Booster vol.1' },
    { id: 'P', name: 'PROMO - Promotion Cards' },
    { id: 'ST', name: 'ST - Full Starter Decks' },
    { id: 'Other', name: 'OTHER - Special Products' }
  ];

  const getCardImageUrl = (url) => {
    if (!url) return '';
    return `${import.meta.env.VITE_API_URL}/api/card-image?url=${encodeURIComponent(url)}`;
  };

  const fileInputRef = React.useRef(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileFilterOpen]);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
        setShowUploadPopup(true);
        e.target.value = '';
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/cards`)
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch cards", err);
        setLoading(false);
      });
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const CardSetFilter = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const dropdownRef = React.useRef(null);
    const inputRef = React.useRef(null);

    const filteredOptions = SETS.filter(opt => 
      opt.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
      opt.id.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const selectedOption = SETS.find(s => s.id === value) || SETS[0];

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-all shadow-lg"
        >
          <div className="flex flex-col items-start translate-y-[-1px]">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Set / Collection</span>
             <span className="text-[12px] text-white font-black uppercase tracking-wider truncate max-w-[200px]">
                {selectedOption.id !== 'all' ? `${selectedOption.id} - ` : ''}{selectedOption.name}
             </span>
          </div>
          <Filter className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : 'group-hover:text-white'}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[200] mt-3 w-full bg-slate-950/98 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-white/5">
            <div className="p-4 border-b border-white/5 bg-slate-950/20">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by ID or Name (e.g. OP15)..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[11px] text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold placeholder:text-slate-600"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar py-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setFilterQuery('');
                    }}
                    className={`w-full px-5 py-4 text-left text-[11px] font-black transition-all flex items-center justify-between group ${value === opt.id ? 'bg-amber-500/15 text-amber-500' : 'text-slate-400 hover:bg-white/10 hover:text-white border-l-2 border-transparent hover:border-amber-500/30'}`}
                  >
                    <div className="flex flex-col">
                       <span className={`uppercase tracking-widest text-[9px] mb-0.5 ${value === opt.id ? 'text-amber-500/70' : 'text-slate-600'}`}>{opt.id}</span>
                       <span className="truncate uppercase tracking-wider">{opt.name}</span>
                    </div>
                    {value === opt.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-5 py-10 text-[11px] text-slate-600 text-center font-bold italic">No matching sets found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ImageWithLoader = ({ src, alt, className }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className={`absolute inset-0 bg-slate-800 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`} />
        <img 
          src={src} alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)} loading="lazy"
        />
      </div>
    );
  };

  const filteredCards = cards.filter(card => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || 
                          card.name.toLowerCase().includes(searchLower) || 
                          card.id.toLowerCase().includes(searchLower);
    
    // Normalize RARITY for exact matching (e.g. 'SEC' === 'SEC')
    const cardRarity = (card.rarity || '').toUpperCase().trim();
    const filterRarity = (selectedRarity || 'all').toUpperCase().trim();
    const matchesRarity = filterRarity === 'ALL' || cardRarity === filterRarity;

    // Normalize SET for exact matching
    const cardSet = (card.set || '').toUpperCase().trim();
    const filterSet = (selectedSet || 'all').toUpperCase().trim();
    const matchesSet = filterSet === 'ALL' || cardSet === filterSet;

    return matchesSearch && matchesRarity && matchesSet;
  });

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        if (i < totalPages && i > 1) {
            range.push(i);
        }
    }
    if (totalPages > 1) range.push(totalPages);

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFilterActive = searchTerm !== '' || selectedSet !== 'all' || selectedRarity !== 'all';
  const resetFilters = () => {
    setSelectedSet('all'); setSelectedRarity('all'); setSearchTerm(''); setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 lg:pt-[170px]">
           <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-6 sticky top-24">
              <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Find Card</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" placeholder="Search name, ID..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                 <div className="group relative">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-5 rounded-xl bg-white/5 border border-white/10 text-white font-black flex flex-col items-center justify-center gap-2 hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
                    >
                       <Upload className="w-6 h-6" />
                       <span className="text-[10px] uppercase tracking-widest leading-none">Upload Image</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-2.5 rounded-xl bg-black border border-white/10 text-white text-[9px] font-black leading-relaxed tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20">
                       UPLOAD AN IMAGE TO IDENTIFY YOUR CARD AUTOMATICALLY.
                    </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Market Rate</h2>
                <div className="relative group/market">
                  <div className="flex p-1 bg-black/40 border border-white/5 rounded-[10px] relative overflow-hidden ring-1 ring-white/10 shadow-2xl h-12">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-gradient-to-r from-amber-400 to-orange-500 rounded-[8px] transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) shadow-[0_0_20px_rgba(251,191,36,0.2)] ${marketLocale === 'EN' ? 'translate-x-0' : 'translate-x-full'}`} />
                    <button onClick={() => setMarketLocale('EN')} className={`relative z-10 flex-1 flex items-center justify-center text-[10px] font-black transition-all ${marketLocale === 'EN' ? 'text-white scale-105' : 'text-slate-500 hover:text-white'}`}>GLOBAL</button>
                    <button onClick={() => setMarketLocale('JP')} className={`relative z-10 flex-1 flex items-center justify-center text-[10px] font-black transition-all ${marketLocale === 'JP' ? 'text-white scale-105' : 'text-slate-500 hover:text-white'}`}>JAPANESE</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Set</h3>
                <CardSetFilter value={selectedSet} onChange={(val) => { setSelectedSet(val); setCurrentPage(1); }} />
              </div>
              
              <button 
                onClick={resetFilters} disabled={!isFilterActive}
                className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${isFilterActive ? 'bg-white text-slate-950 border-white hover:shadow-2xl hover:scale-105' : 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed opacity-50'}`}
              >
                <X className="w-3.5 h-3.5" /> RESET
              </button>
           </div>
        </div>

        {/* Professional Bottom Sheet (Mobile Filter Drawer) */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileFilterOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileFilterOpen(false)} />
          
          <div className={`absolute top-0 right-0 bottom-0 w-full max-w-xs bg-slate-950 border-l border-white/10 transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) flex flex-col ${mobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer Header - Traditional Professional Sidebar */}
            <div className="flex-shrink-0 bg-slate-950 px-6 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-white" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Filters</h2>
                {isFilterActive && (
                  <div className="ml-2 px-2.5 py-0.5 bg-white text-slate-950 text-[10px] font-black rounded-full uppercase">
                    {[selectedSet !== 'all', searchTerm, selectedRarity !== 'all'].filter(Boolean).length}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto drawer-scrollbar px-6 py-2 space-y-6">
              <div className="pb-2 border-b border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Market Rate</h3>
                <div className="flex p-1 bg-black border border-white/5 rounded-[10px] h-11 relative overflow-hidden">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-gradient-to-r from-amber-400 to-orange-500 rounded-[8px] transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] ${marketLocale === 'EN' ? 'translate-x-0' : 'translate-x-full'}`} />
                    <button onClick={() => setMarketLocale('EN')} className={`relative z-10 flex-1 text-[10px] font-black transition-all ${marketLocale === 'EN' ? 'text-white' : 'text-slate-400'}`}>GLOBAL</button>
                    <button onClick={() => setMarketLocale('JP')} className={`relative z-10 flex-1 text-[10px] font-black transition-all ${marketLocale === 'JP' ? 'text-white' : 'text-slate-400'}`}>JAPANESE</button>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Find Card</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" placeholder="Card name or ID..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                 <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest">Identify By Image</span>
                 </button>
              </div>

              <div className="pt-2 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Market Region</h3>
                <div className="flex p-1 bg-black border border-white/5 rounded-2xl h-11 relative overflow-hidden">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] ${marketLocale === 'EN' ? 'translate-x-0' : 'translate-x-full'}`} />
                    <button onClick={() => setMarketLocale('EN')} className={`relative z-10 flex-1 text-[10px] font-black transition-all ${marketLocale === 'EN' ? 'text-white' : 'text-slate-400'}`}>GLOBAL (EN)</button>
                    <button onClick={() => setMarketLocale('JP')} className={`relative z-10 flex-1 text-[10px] font-black transition-all ${marketLocale === 'JP' ? 'text-white' : 'text-slate-400'}`}>LOCAL (JP)</button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Expansion Set</h3>
                <CardSetFilter value={selectedSet} onChange={(val) => { setSelectedSet(val); setCurrentPage(1); }} />
              </div>
              
              <div className="pt-6 pb-12 border-t border-white/5">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-4 rounded-xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                  >
                    View Results
                  </button>
                  <button 
                    onClick={resetFilters}
                    disabled={!isFilterActive}
                    className={`w-full py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isFilterActive ? 'bg-black text-white border-white/20' : 'bg-slate-900 text-slate-700 border-white/5 cursor-not-allowed opacity-30'}`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 pt-0">
                     {/* Top Rarity Filter - Centered with Precise Geometry */}
           <div className="mb-12 relative">
                <div className="flex items-center justify-center gap-3">
                    {/* Left Navigation Control */}
                    <button 
                        onClick={() => filterScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })} 
                        className="flex-shrink-0 w-10 h-10 items-center justify-center rounded-[10px] bg-slate-900 border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all flex shadow-xl active:scale-90"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Uniform Filter Rail */}
                    <div 
                        ref={filterScrollRef} 
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x px-1 py-2" 
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* 'All' Selector */}
                        <button 
                            onClick={() => { setSelectedRarity('all'); setCurrentPage(1); }} 
                            className={`flex-shrink-0 w-16 h-10 flex items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all border snap-start ${selectedRarity === 'all' ? 'bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                            All
                        </button>
                        
                        {/* Dynamic Rarity Selectors */}
                        {RARITIES.map(r => (
                            <button 
                                key={r.id} 
                                onClick={() => { setSelectedRarity(r.code); setCurrentPage(1); }} 
                                className={`flex-shrink-0 w-16 h-10 flex items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all border snap-start ${selectedRarity === r.code ? `bg-gradient-to-r ${r.gradient} text-white border-transparent shadow-lg` : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/20 hover:text-white'}`}
                            >
                                {r.code}
                            </button>
                        ))}
                    </div>

                    {/* Right Navigation Control */}
                    <button 
                        onClick={() => filterScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })} 
                        className="flex-shrink-0 w-10 h-10 items-center justify-center rounded-[10px] bg-slate-900 border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all flex shadow-xl active:scale-90"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
           </div>
           {/* Consolidated Results Header (Optimized One-Line) */}
           <div className="mb-6 lg:mb-12 flex flex-row items-center justify-between gap-1 sm:gap-6 px-1">
               <div className="flex items-center gap-1.5 sm:gap-4 flex-nowrap min-w-0">
                  <h2 className="text-base xs:text-lg sm:text-lg md:text-2xl lg:text-4xl font-black text-white tracking-tight leading-relaxed whitespace-nowrap">
                    Card Library
                  </h2>
                  <div className="px-3 py-2 bg-slate-900/50 rounded-xl border border-white/5 backdrop-blur-md flex-shrink-0 flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <span className="text-slate-400 text-[10px] font-black leading-none uppercase tracking-[0.2em] whitespace-nowrap">
                      {filteredCards.length}
                    </span>
                  </div>
               </div>

               <div className="flex items-center gap-1 sm:gap-4 flex-nowrap flex-shrink-0">
                  {/* Compact Currency Toggle */}
                  <div className="relative group/curr">
                     <div className="flex p-0.5 bg-black border border-white/5 rounded-[10px] relative overflow-hidden shadow-2xl ring-1 ring-white/10 w-24 xs:w-28 sm:w-32 md:w-36 h-7 sm:h-10">
                       <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] bg-gradient-to-r from-amber-400 to-orange-500 rounded-[8px] transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) shadow-[0_0_20px_rgba(251,191,36,0.3)] ${currency === 'USD' ? 'translate-x-0' : 'translate-x-full'}`} />
                       <button onClick={() => setCurrency('USD')} className={`relative z-10 flex-1 flex items-center justify-center text-[7px] sm:text-[9px] md:text-[10px] font-black transition-all ${currency === 'USD' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>USD <span className="hidden sm:inline">($)</span></button>
                       <button onClick={() => setCurrency('INR')} className={`relative z-10 flex-1 flex items-center justify-center text-[7px] sm:text-[9px] md:text-[10px] font-black transition-all ${currency === 'INR' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>INR <span className="hidden sm:inline">(₹)</span></button>
                     </div>
                  </div>

                  {/* Settings Button */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-1.5 sm:py-3.5 bg-white text-slate-950 rounded-lg sm:rounded-xl shadow-xl hover:shadow-white/20 transition-all active:scale-95"
                  >
                    <SlidersHorizontal className="w-3 h-3 sm:w-5 sm:h-5 text-slate-950" strokeWidth={3} />
                    <span className="text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-widest hidden md:inline">Settings</span>
                    {/* Badge */}
                    {isFilterActive && (
                      <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-slate-900 rounded-full flex items-center justify-center border border-white/20">
                        <span className="text-white text-[6px] sm:text-[8px] font-black">
                           {[selectedSet !== 'all', searchTerm, selectedRarity !== 'all'].filter(Boolean).length}
                        </span>
                      </div>
                    )}
                  </button>
               </div>
           </div>

           {/* Card Grid */}
           {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[2.5/3.5] rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginatedCards.length > 0 ? (
                    paginatedCards.map((card, index) => (
                        <div 
                        key={card.id} onClick={() => setSelectedCard(card)}
                        className="cursor-pointer group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 hover:border-white/50 transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-2 opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                        style={{ animationDelay: `${index * 50}ms` }}
                        >
                        <div className="aspect-[2.5/3.5] overflow-hidden bg-slate-950 relative">
                            <ImageWithLoader src={getCardImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent pt-12">
                            <div className="text-[11px] font-black text-white truncate uppercase tracking-wider">{card.name}</div>
                            <div className="text-[10px] text-white font-bold mt-1 opacity-80 uppercase tracking-tighter">
                            ~ {formatPrice(marketLocale === 'EN' ? card.priceEnglish : card.priceJapanese, currency, USD_TO_INR)}
                            </div>
                        </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">No cards discovered yet.</div>
                )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-16 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 px-4">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                            disabled={currentPage === 1}
                            className={`px-4 sm:px-5 py-2.5 rounded-lg sm:rounded-xl border transition-all text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${currentPage === 1 ? 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white active:scale-95'}`}
                        >
                            Prev
                        </button>

                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {getPageNumbers().map((page, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                    className={`min-w-[36px] sm:min-w-[44px] h-9 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-black transition-all ${page === currentPage ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : page === '...' ? 'bg-transparent border-transparent text-slate-600 cursor-default' : 'bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20 hover:text-white active:scale-95'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                            disabled={currentPage === totalPages}
                            className={`px-4 sm:px-5 py-2.5 rounded-lg sm:rounded-xl border transition-all text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${currentPage === totalPages ? 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed' : 'bg-slate-900/80 border-white/10 text-white hover:bg-white/5 active:scale-95'}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </>
          )}
        </div>
      </div>


      {/* Detail Popup */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedCard(null)}>
          <div className="bg-slate-950 w-full max-w-sm md:max-w-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col no-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/5 text-white hover:bg-white hover:text-slate-950 transition-all z-50"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            <div className="flex flex-col sm:flex-row overflow-y-auto no-scrollbar">
              <div className="sm:w-1/2 bg-black/50 p-6 sm:p-8 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-white/5">
                 <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 max-w-[160px] sm:max-w-[220px]">
                    <img src={getCardImageUrl(selectedCard.image)} alt={selectedCard.name} className="w-full object-cover" />
                 </div>
              </div>
              <div className="sm:w-1/2 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
                 <div className="text-center sm:text-left">
                   <div className="text-[9px] sm:text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">{selectedCard.set} • {selectedCard.id}</div>
                   <h2 className="text-xl sm:text-3xl font-black text-white leading-none uppercase italic tracking-tight">{selectedCard.name}</h2>
                 </div>
                  <div className="bg-white text-slate-950 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
                     <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-center mb-0.5 sm:mb-1 opacity-60">{marketLocale === 'EN' ? 'Global' : 'Local'} Estimate</div>
                     <div className="text-xl sm:text-2xl font-black text-center tabular-nums leading-none">{formatPrice(marketLocale === 'EN' ? selectedCard.priceEnglish : selectedCard.priceJapanese, currency, USD_TO_INR)}</div>
                  </div>
                 <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2 sm:pb-3"><span className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest">Rarity</span><span className="text-[11px] sm:text-xs font-black text-white uppercase italic">{selectedCard.rarity}</span></div>
                    <button 
                      onClick={() => toggleOwnedCard(selectedCard.id)}
                      className={`w-full py-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${
                        ownedCards[selectedCard.id] 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white text-slate-950 border-white hover:scale-[1.02] active:scale-95 shadow-xl'
                      }`}
                    >
                      {ownedCards[selectedCard.id] ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved in Vault
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4" />
                          Add to Profile Vault
                        </>
                      )}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Scanner Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300" onClick={() => setShowUploadPopup(false)}>
            <div className="bg-slate-950 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowUploadPopup(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10"><Upload className="w-10 h-10 text-white" /></div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-widest">AI Scanner</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-bold">We are building an advanced AI model to identify your cards automatically. Stay tuned for the release!</p>
                <button onClick={() => setShowUploadPopup(false)} className="w-full py-4 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Understood</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
