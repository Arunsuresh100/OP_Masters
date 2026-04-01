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
    { id: 'all', name: 'ALL' },
    { id: 'PRB02', name: 'Premium Booster vol.2 [PRB-02]' },
    { id: 'PRB01', name: 'Premium Booster [PRB-01]' },
    { id: 'EB03', name: 'Extra Booster Heroines [EB-03]' },
    { id: 'EB02', name: 'Extra Booster Anime 25th [EB-02]' },
    { id: 'EB01', name: 'Extra Booster Memorial [EB-01]' },
    { id: 'OP15', name: 'Booster Pack [OP15]' },
    { id: 'OP14', name: 'Booster Pack [OP14]' },
    { id: 'OP13', name: 'Booster Pack [OP13]' },
    { id: 'OP12', name: 'Booster Pack [OP12]' },
    { id: 'OP11', name: 'Booster Pack [OP11]' },
    { id: 'OP10', name: 'Booster Pack [OP10]' },
    { id: 'OP09', name: 'Booster Pack [OP09]' },
    { id: 'OP08', name: 'Booster Pack [OP08]' },
    { id: 'OP07', name: 'Booster Pack [OP07]' },
    { id: 'OP06', name: 'Booster Pack [OP06]' },
    { id: 'OP05', name: 'Booster Pack [OP05]' },
    { id: 'OP04', name: 'Booster Pack [OP04]' },
    { id: 'OP03', name: 'Booster Pack [OP03]' },
    { id: 'OP02', name: 'Booster Pack [OP02]' },
    { id: 'OP01', name: 'Booster Pack [OP01]' },
    { id: 'ST29', name: 'Starter Deck [ST-29]' },
    { id: 'ST28', name: 'Starter Deck [ST-28]' },
    { id: 'ST27', name: 'Starter Deck [ST-27]' },
    { id: 'ST26', name: 'Starter Deck [ST-26]' },
    { id: 'ST25', name: 'Starter Deck [ST-25]' },
    { id: 'ST24', name: 'Starter Deck [ST-24]' },
    { id: 'ST23', name: 'Starter Deck [ST-23]' },
    { id: 'ST22', name: 'Starter Deck [ST-22]' },
    { id: 'ST21', name: 'Starter Deck [ST-21]' },
    { id: 'ST20', name: 'Starter Deck [ST-20]' },
    { id: 'ST19', name: 'Starter Deck [ST-19]' },
    { id: 'ST18', name: 'Starter Deck [ST-18]' },
    { id: 'ST17', name: 'Starter Deck [ST-17]' },
    { id: 'ST16', name: 'Starter Deck [ST-16]' },
    { id: 'ST15', name: 'Starter Deck [ST-15]' },
    { id: 'ST14', name: 'Starter Deck [ST-14]' },
    { id: 'ST13', name: 'Starter Deck [ST-13]' },
    { id: 'ST12', name: 'Starter Deck [ST-12]' },
    { id: 'ST11', name: 'Starter Deck [ST-11]' },
    { id: 'ST10', name: 'Starter Deck [ST-10]' },
    { id: 'ST09', name: 'Starter Deck [ST-09]' },
    { id: 'ST08', name: 'Starter Deck [ST-08]' },
    { id: 'ST07', name: 'Starter Deck [ST-07]' },
    { id: 'ST06', name: 'Starter Deck [ST-06]' },
    { id: 'ST05', name: 'Starter Deck [ST-05]' },
    { id: 'ST04', name: 'Starter Deck [ST-04]' },
    { id: 'ST03', name: 'Starter Deck [ST-03]' },
    { id: 'ST02', name: 'Starter Deck [ST-02]' },
    { id: 'ST01', name: 'Starter Deck [ST-01]' },
    { id: 'P', name: 'Promotion Cards' },
    { id: 'Other', name: 'Other Products' }
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

  const [marketMetadata, setMarketMetadata] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/cards`)
      .then(res => res.json())
      .then(data => {
        // Handle new Market Data Bridge structure
        if (data.cards) {
            setCards(data.cards);
            setMarketMetadata({
                last_synced_at: data.last_synced_at,
                source: data.source,
                total: data.total_cards
            });
        } else {
            // Fallback for legacy arrays
            setCards(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch cards", err);
        setLoading(false);
      });
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const SearchableSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const dropdownRef = React.useRef(null);
    const inputRef = React.useRef(null);

    const selectedOption = options.find(opt => opt.id === value) || options[0];

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
      opt.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      opt.id.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 pl-4 pr-10 text-[11px] font-black text-white text-left hover:border-white transition-all flex items-center justify-between group"
        >
          <span className="truncate">{selectedOption.name}</span>
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : 'text-slate-500 group-hover:text-white'}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-white/5 bg-slate-950/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search set..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-white/20 transition-all font-bold"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
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
                    className={`w-full px-4 py-3.5 text-left text-[11px] font-black transition-all flex items-center justify-between group ${value === opt.id ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="truncate uppercase tracking-wider">{opt.name}</span>
                    {value === opt.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-[11px] text-slate-500 text-center font-bold">No results found</div>
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
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
    const matchesSet = selectedSet === 'all' || card.set === selectedSet;
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
                <SearchableSelect options={SETS} value={selectedSet} onChange={(val) => { setSelectedSet(val); setCurrentPage(1); }} placeholder="Select Set" />
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
                <SearchableSelect options={SETS} value={selectedSet} onChange={(val) => { setSelectedSet(val); setCurrentPage(1); }} placeholder="Expansion" />
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
           <div className="mb-6 lg:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-1">
               <div className="flex flex-col gap-1 sm:gap-4 flex-nowrap min-w-0">
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-base xs:text-lg sm:text-lg md:text-2xl lg:text-4xl font-black text-white tracking-tight leading-relaxed whitespace-nowrap uppercase">
                        Card Library
                    </h2>
                    {marketMetadata && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Market Uplink Online</span>
                            <span className="text-[8px] font-medium text-slate-500 uppercase tracking-widest leading-none border-l border-white/10 pl-2">
                                Last Sync: {new Date(marketMetadata.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                      <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Catalog Capacity: {filteredCards.length} Cards</span>
                      {marketMetadata && <span className="hidden xs:inline text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap border-l border-white/5 pl-4 px-2">Market Source: {marketMetadata.source}</span>}
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
