import React, { useState, useEffect } from 'react';
import { Search, Upload, X, Info, Filter, SlidersHorizontal } from 'lucide-react';
import { RARITIES, USD_TO_INR } from '../constants';
import { formatPrice } from '../utils';

const Cards = ({ currency }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Filters
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSet, setSelectedSet] = useState('all');

  const COLORS = ['Red', 'Blue', 'Green', 'Purple', 'Black', 'Yellow'];
  const SETS = ['OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12', 'OP13'];

  // Upload Logic
  const fileInputRef = React.useRef(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
        // In a real app, we would upload functionality here
        // For now, prompt the user as requested
        setShowUploadPopup(true);
        // Reset input
        e.target.value = '';
    }
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/cards')
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 4 rows * 5 columns approx

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

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
    const matchesColor = selectedColor === 'all' || (card.colors && card.colors.includes(selectedColor));
    const matchesSet = selectedSet === 'all' || card.set === selectedSet;

    return matchesSearch && matchesRarity && matchesColor && matchesSet;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
      setSelectedColor('all');
      setSelectedSet('all');
      setSelectedRarity('all');
      setSearchTerm('');
      setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 lg:mt-[120px]">
           <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-6 sticky top-24">
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {/* Search */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Find Card</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search name, ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div className="pt-4 border-t border-white/5">
                 <div className="group relative">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 font-bold flex flex-col items-center justify-center gap-2 hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all shadow-lg shadow-amber-900/10 hover:shadow-amber-500/20"
                    >
                       <Upload className="w-6 h-6" />
                       <span className="text-xs uppercase tracking-wider">Upload Image</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-black/90 text-white text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-20">
                       Upload an image to identify your card automatically.
                    </div>
                 </div>
              </div>

              {/* Color Filter */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Color</h3>
                <div className="grid grid-cols-3 gap-2">
                    {COLORS.map(color => (
                        <button 
                            key={color}
                            onClick={() => setSelectedColor(selectedColor === color ? 'all' : color)}
                            className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center ${selectedColor === color ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
              </div>

              {/* Set Filter */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Set</h3>
                <div className="grid grid-cols-3 gap-2">
                    {SETS.map(set => (
                        <button 
                            key={set}
                            onClick={() => setSelectedSet(selectedSet === set ? 'all' : set)}
                            className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center ${selectedSet === set ? 'bg-white text-slate-950 border-white shadow-md' : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
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

        {/* Mobile Filter Drawer */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileFilterOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileFilterOpen(false)}
          />
          
          {/* Drawer */}
          <div className={`absolute bottom-0 left-0 right-0 bg-slate-950 rounded-t-3xl border-t border-x border-white/10 max-h-[85vh] overflow-y-auto transition-transform duration-300 ${mobileFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Drawer Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-white">Filters</h2>
              </div>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Search */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Find Card</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search name, ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Color Filter */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Color</h3>
                <div className="grid grid-cols-3 gap-2">
                    {COLORS.map(color => (
                        <button 
                            key={color}
                            onClick={() => setSelectedColor(selectedColor === color ? 'all' : color)}
                            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${selectedColor === color ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg' : 'bg-slate-900 text-slate-400 border-white/5 hover:border-amber-500/30 hover:bg-white/5'}`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
              </div>

              {/* Set Filter */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Set</h3>
                <div className="grid grid-cols-3 gap-2">
                    {SETS.map(set => (
                        <button 
                            key={set}
                            onClick={() => setSelectedSet(selectedSet === set ? 'all' : set)}
                            className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${selectedSet === set ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            {set}
                        </button>
                    ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reset
                </button>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold uppercase tracking-widest hover:bg-amber-600 transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Filter Button (Mobile/Tablet Only) */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <SlidersHorizontal className="w-6 h-6 text-white" />
          {/* Active Filters Badge */}
          {(selectedColor !== 'all' || selectedSet !== 'all' || searchTerm) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <span className="text-white text-[10px] font-black">
                {[selectedColor !== 'all', selectedSet !== 'all', searchTerm].filter(Boolean).length}
              </span>
            </div>
          )}
        </button>

        {/* Right Content (Cards Grid) */}
        <div className="lg:col-span-3 pt-0">
           
           {/* Top Rarity Filter (Centered) */}
           <div className="mb-8 flex justify-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <button 
                    onClick={() => setSelectedRarity('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedRarity === 'all' ? 'bg-white text-slate-950 shadow-lg shadow-white/10' : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-white/5'}`}
                  >
                    All
                  </button>
                  {RARITIES.map(r => (
                    <button 
                        key={r.id}
                        onClick={() => setSelectedRarity(r.code)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedRarity === r.code ? `bg-gradient-to-r ${r.gradient} text-white border-transparent shadow-lg` : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-white/5'}`}
                    >
                        {r.code}
                    </button>
                  ))}
              </div>
           </div>

           <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                 Card Library <span className="text-slate-500 text-sm font-normal ml-2">({filteredCards.length} results)</span>
              </h2>
           </div>

           {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2.5/3.5] rounded-xl bg-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedCards.length > 0 ? (
                    paginatedCards.map(card => (
                        <div 
                        key={card.id} 
                        onClick={() => setSelectedCard(card)}
                        className="cursor-pointer group relative bg-slate-900 rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/50 transition-all hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] hover:-translate-y-2"
                        >
                        <div className="aspect-[2.5/3.5] overflow-hidden bg-slate-950 relative">
                            <ImageWithLoader 
                                src={card.image} 
                                alt={card.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10">
                            <div className="text-xs font-bold text-white truncate">{card.name}</div>
                            <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                            ~${formatPrice(card.price, currency, USD_TO_INR)}
                            </div>
                        </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No cards found matching your filters.
                    </div>
                )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${currentPage === 1 ? 'bg-slate-900 text-slate-600 border-white/5 cursor-not-allowed' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'}`}
                        >
                            Prev
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                           {[...Array(totalPages)].map((_, i) => {
                               const page = i + 1;
                               // Show first, last, and pages around current
                               if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                   return (
                                       <button
                                           key={page}
                                           onClick={() => handlePageChange(page)}
                                           className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${currentPage === page ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}
                                       >
                                           {page}
                                       </button>
                                   );
                               } else if (page === currentPage - 2 || page === currentPage + 2) {
                                   return <span key={page} className="flex items-center justify-center w-8 h-8 text-slate-600">...</span>;
                               }
                               return null;
                           })}
                        </div>

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${currentPage === totalPages ? 'bg-slate-900 text-slate-600 border-white/5 cursor-not-allowed' : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700'}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Detail Popup (Modal) */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCard(null)}>
          {/* ... existing card detail modal ... */}
          <div 
            className="bg-slate-900 w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-slate-950 p-6 flex items-center justify-center">
                 <div className="relative rounded-xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                    <img src={selectedCard.image} alt={selectedCard.name} className="w-full object-cover max-w-[200px]" />
                 </div>
              </div>
              
              <div className="md:w-1/2 p-6 flex flex-col gap-4">
                 <div>
                   <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">{selectedCard.set} • {selectedCard.id}</div>
                   <h2 className="text-2xl font-black text-white leading-tight">{selectedCard.name}</h2>
                 </div>

                 <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold text-center mb-1">Approximate Value</div>
                    <div className="text-xl font-mono font-bold text-emerald-400 text-center">
                      ${formatPrice(selectedCard.price, currency, USD_TO_INR)}
                    </div>
                 </div>

                 <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                       <span className="text-slate-500">Rarity</span>
                       <span className="font-bold">{selectedCard.rarity}</span>
                    </div>
                 </div>
                 
                 <div className="mt-auto pt-4">
                   <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20 flex gap-2">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <p>Prices are estimates based on recent market activity.</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Feature Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadPopup(false)}>
            <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => setShowUploadPopup(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-amber-500" />
                </div>
                
                <h3 className="text-xl font-black text-white mb-2">AI Scanner Coming Soon!</h3>
                <p className="text-slate-400 text-sm mb-6">
                    We are building an advanced AI model to identify your cards automatically from photos. Stay tuned for updates!
                </p>
                
                <button 
                    onClick={() => setShowUploadPopup(false)}
                    className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Cards;
