import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldCheck, ArrowRight, Camera, Search, Loader2, RotateCcw, ChevronLeft, ChevronRight, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { USD_TO_INR } from '../constants';

// --- CardImage Component with Optimized Loading & Premium Hover ---
const CardImage = ({ src, alt, className, imageClassName = "object-cover", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (priority) {
            const img = new Image();
            img.src = src;
            img.onload = () => setIsLoaded(true);
        }
    }, [src, priority]);

    return (
        <div className={`relative ${className} bg-slate-900/50 rounded-xl overflow-hidden group/img border border-transparent`}>
            {!isLoaded && (
                <div className="absolute inset-0 bg-slate-800/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-slate-600 animate-spin" />
                    </div>
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full ${imageClassName} transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100 group-hover/img:scale-105' : 'opacity-0 scale-105 blur-sm'}`} 
            />
            {isLoaded && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />}
        </div>
    );
};

const ListingModal = ({ isOpen, onClose, card }) => {
    const { user, openAuth } = useUser();
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [condition, setCondition] = useState('Near Mint');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1);
    
    // --- Data & Search State ---
    const [allCards, setAllCards] = useState([]);
    const [isFetchingCards, setIsFetchingCards] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedRarity, setSelectedRarity] = useState('All');
    const [selectedCard, setSelectedCard] = useState(card || null);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // --- Fetch Cards ---
    useEffect(() => {
        const fetchCards = async () => {
            setIsFetchingCards(true);
            try {
                const response = await fetch('http://localhost:3001/api/cards');
                if (response.ok) {
                    const data = await response.json();
                    setAllCards(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch:", error);
            } finally {
                setIsFetchingCards(false);
            }
        };

        if (isOpen && !allCards.length) fetchCards();
    }, [isOpen, allCards.length]);

    const [showConfirm, setShowConfirm] = useState(false);

    // --- Reset State ---
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPrice('');
            setLoading(false);
            setCurrency('INR');
            setShowConfirm(false);
            setError(null);
            if (card) setSelectedCard(card);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            if (!card) {
                setSelectedCard(null);
                setSearchQuery('');
                setSelectedType('All');
                setSelectedRarity('All');
                setCurrentPage(1);
            }
        }
    }, [isOpen, card]);

    // --- Filtering Logic ---
    const filteredCards = useMemo(() => {
        return allCards.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  c.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === 'All' || c.type === selectedType;
            const matchesRarity = selectedRarity === 'All' || 
                                  (selectedRarity === 'L' && c.type === 'Leader') || 
                                  (selectedRarity === 'M' && (c.rarity === 'Manga' || (c.name && c.name.includes('Manga')))) || 
                                  c.rarity === selectedRarity;
            return matchesSearch && matchesType && matchesRarity;
        });
    }, [allCards, searchQuery, selectedType, selectedRarity]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCards.slice(start, start + itemsPerPage);
    }, [filteredCards, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedType, selectedRarity]);

    const getPaginationRange = () => {
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift('...');
        if (currentPage + delta < totalPages - 1) range.push('...');
        range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    // --- Calculations ---
    const marketPriceDisplay = selectedCard?.price ? (currency === 'INR' ? selectedCard.price * USD_TO_INR : selectedCard.price) : 0;
    const marketPriceLabel = currency === 'INR' ? `₹${Math.floor(marketPriceDisplay).toLocaleString()}` : `$${marketPriceDisplay.toFixed(2)}`;
    const dailyDemand = useMemo(() => {
        if (!selectedCard) return 'Medium';
        if (selectedCard.price > 100) return 'High';
        if (selectedCard.price > 20) return 'Medium';
        return 'Low';
    }, [selectedCard]);

    const handleReset = () => {
        setSearchQuery('');
        setSelectedType('All');
        setSelectedRarity('All');
        setCurrentPage(1);
    };

    if (!isOpen) return null;

    if (!user) {
        return (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] border border-white/10 p-8 text-center space-y-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-b-amber-500/20">
                    <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <ShieldCheck className="w-10 h-10 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Grand Line Access</h2>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">Verification required to list assets on the marketplace.</p>
                    </div>
                    <button 
                        onClick={() => { onClose(); openAuth('login'); }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_15px_30px_rgba(180,83,9,0.3)]"
                    > Sign In to Trade </button>
                    <button onClick={onClose} className="text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Return to Surface</button>
                </div>
            </div>
        );
    }

    const handleConfirm = (e) => {
        e.preventDefault();
        setError(null);
        
        if (!price || parseFloat(price) <= 0) {
           setError("Please enter a valid price.");
           return;
        }

        // High Price Validation (Explicit Error instead of disabled button)
        if (marketPriceDisplay > 0 && parseFloat(price) > marketPriceDisplay * 5) {
            setError("Price is significantly above market value. Please adjust to continue.");
            return;
        }

        setShowConfirm(true);
    };

    const handleFinalConfirm = async () => {
        if (!selectedCard) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/trade/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'sell', 
                    card: selectedCard, 
                    price: parseFloat(price),
                    quantity: 1, 
                    total: parseFloat(price), 
                    currency, 
                    userEmail: user.email, 
                    status: 'pending' 
                })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Failed to list asset. Please try again.');
                setShowConfirm(false); // Go back to edit on error
            }
        } catch (error) { 
            console.error('Error:', error);
            setError('Network error. Please check your connection.');
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center px-6 py-2 md:p-6 bg-black/98 md:bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
            {/* Modal Glass Container */}
            <div className={`bg-transparent w-full transition-all duration-700 flex items-center justify-center ${step === 2 ? 'max-w-4xl' : selectedCard ? 'max-w-5xl' : 'max-w-6xl'}`}>
                
                {step === 1 ? (
                    <div className={`relative flex flex-col w-full transition-all duration-700 rounded-[2rem] md:rounded-[2.5rem] bg-slate-950 border overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.9)] ${selectedCard ? 'h-[85vh] max-h-[90vh] md:h-auto md:flex-row border-white/5' : 'h-[92vh] md:h-[85vh] bg-slate-900/40 border-white/[0.08]'}`}>
                        
                        {!selectedCard ? (
                            // STAGE 1: IMMERSIVE EXPLORER
                            <div className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-hidden relative">
                                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />
                                
                                <button onClick={onClose} className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-white/5 text-slate-600 hover:text-white transition-all z-30 group">
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>

                                <div className="w-full max-w-5xl flex flex-col h-full gap-4 relative z-10">
                                    {/* Elevated Header */}
                                    <div className="text-center shrink-0 space-y-2 md:space-y-3">
                                        <div className="space-y-0.5 md:space-y-1">
                                            <span className="text-[9px] md:text-[10px] font-black text-amber-500/80 uppercase tracking-[0.5em]">Inventory selection</span>
                                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Choose Your Asset</h2>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 justify-center">
                                            <div className="relative group w-full max-w-lg">
                                                <div className="absolute inset-0 bg-amber-500/5 blur-xl group-focus-within:bg-amber-500/10 transition-colors rounded-3xl pointer-events-none" />
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by ID, Name or Keyword..." 
                                                    className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[1rem] py-2.5 md:py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/40 transition-all shadow-xl"
                                                />
                                            </div>
                                            
                                            <div className="flex p-1 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/5 shadow-xl">
                                                {['All', 'Character', 'Event', 'Stage'].map((type) => (
                                                    <button 
                                                        key={type}
                                                        onClick={() => setSelectedType(type)}
                                                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedType === type ? 'bg-amber-500 text-slate-950 shadow-[0_5px_15px_rgba(245,158,11,0.4)] scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                                                    > {type === 'Character' ? 'Char' : type} </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                                            {['All', 'L', 'C', 'UC', 'R', 'SR', 'SEC', 'M'].map((code) => (
                                                <button
                                                    key={code}
                                                    onClick={() => setSelectedRarity(code)}
                                                    className={`min-w-[32px] h-7 rounded-lg text-[9px] font-black uppercase border transition-all ${selectedRarity === code ? 'bg-slate-50 text-slate-950 border-white' : 'bg-slate-900/40 text-slate-600 border-white/5 hover:border-white/20 hover:text-white'}`}
                                                > {code} </button>
                                            ))}
                                            {(searchQuery || selectedType !== 'All' || selectedRarity !== 'All') && (
                                                <button onClick={handleReset} className="ml-3 text-[9px] font-black uppercase text-rose-500 flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/5 rounded-md border border-rose-500/10 hover:bg-rose-500/10 transition-all">
                                                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Breathable Grid */}
                                    <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 py-6 pr-2">

                                        
                                        {isFetchingCards ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-full mx-auto px-2">
                                                {[...Array(12)].map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="aspect-[2.5/3.5] rounded-2xl bg-slate-900/40 border border-white/5 relative overflow-hidden"
                                                        style={{ animation: 'fadeIn 0.5s ease-out forwards', animationDelay: `${i * 50}ms` }}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent animate-pulse" />
                                                        <div className="absolute bottom-4 left-4 right-4 h-2 bg-slate-800/50 rounded-full w-2/3 animate-pulse" />
                                                        <div className="absolute bottom-8 left-4 right-4 h-3 bg-slate-800/50 rounded-md w-1/2 animate-pulse" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : currentItems.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
                                                <Search className="w-16 h-16 mb-4 stroke-1" />
                                                <p className="text-sm font-black uppercase tracking-[0.4em]">Zero Assets Found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-full mx-auto px-2">
                                                {currentItems.map((c, index) => (
                                                    <button 
                                                        key={c.id}
                                                        onClick={() => setSelectedCard(c)}
                                                        className="group relative aspect-[2.5/3.5] rounded-2xl transition-all duration-500 hover:scale-[1.05] hover:-translate-y-3 active:scale-95"
                                                        style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: `${index * 40}ms` }}
                                                    >
                                                        <div className="absolute inset-x-2 -bottom-4 h-1/2 bg-amber-500/0 group-hover:bg-amber-500/20 blur-[30px] rounded-full transition-all duration-500" />
                                                        <CardImage src={c.image} alt={c.name} className="w-full h-full border border-white/10 shadow-2xl relative z-10" priority={index < 12} />
                                                        <div className="absolute bottom-4 inset-x-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                                            <div className="text-[8px] font-black text-white truncate uppercase mb-1 drop-shadow-lg">{c.name}</div>
                                                            <div className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[6px] font-black rounded-sm inline-block">{c.id}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Glass Pagination System */}
                                    {totalPages > 1 && (
                                        <div className="shrink-0 flex items-center justify-center gap-6 py-6 border-t border-white/[0.05] w-full">
                                            <button 
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                className="p-3 rounded-[1rem] bg-slate-900/60 border border-white/5 text-slate-500 disabled:opacity-10 hover:text-amber-500 hover:border-amber-500/20 transition-all shadow-xl"
                                            > <ChevronLeft className="w-5 h-5" /> </button>
                                            
                                            <div className="flex items-center gap-2">
                                                {getPaginationRange().map((p, i) => (
                                                    p === '...' ? (
                                                        <span key={`dots-${i}`} className="text-slate-800 text-xs font-black px-2 tracking-widest">...</span>
                                                    ) : (
                                                        <button 
                                                            key={p}
                                                            onClick={() => setCurrentPage(p)}
                                                            className={`w-10 h-10 rounded-[1rem] text-xs font-black transition-all flex items-center justify-center border ${currentPage === p ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-[0_10px_20px_rgba(245,158,11,0.2)] scale-110' : 'bg-slate-900/40 text-slate-400 border-white/5 hover:text-white hover:border-white/20'}`}
                                                        > {p} </button>
                                                    )
                                                ))}
                                            </div>

                                            <button 
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                className="p-3 rounded-[1rem] bg-slate-900/60 border border-white/5 text-slate-500 disabled:opacity-10 hover:text-amber-500 hover:border-amber-500/20 transition-all shadow-xl"
                                            > <ChevronRight className="w-5 h-5" /> </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // STAGE 2: PREMIUM APP CARD (SELL) - UNIFIED CENTERED LAYOUT
                            <div className="flex flex-col md:flex-row w-full bg-slate-950 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl w-full max-w-sm md:max-w-4xl mx-auto h-auto md:h-[500px] lg:h-[550px]">
                                
                                {/* Top Hero Section (Unified styling, Centered Content) */}
                                <div className="w-full md:w-[40%] relative p-6 flex flex-col items-center justify-center gap-4 shrink-0 bg-gradient-to-b from-slate-900/40 to-transparent">
                                    
                                    <button 
                                        onClick={() => setSelectedCard(null)}
                                        className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 backdrop-blur-sm"
                                        title="Change Card"
                                    > 
                                        <RotateCcw className="w-4 h-4" />
                                    </button>

                                    {/* Centered Image Container */}
                                    <div className="relative w-32 h-44 md:w-full md:h-full md:max-h-[300px] shrink-0 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-[40px] md:blur-[60px] rounded-full opacity-60 animate-pulse pointer-events-none" />
                                        <CardImage 
                                            src={selectedCard.image} 
                                            alt={selectedCard.name} 
                                            className="h-full aspect-[2.5/3.5] w-auto rounded-xl shadow-2xl relative z-10 border border-white/10" 
                                            imageClassName="object-cover md:object-contain"
                                            priority 
                                        />
                                    </div>

                                    {/* Centered Info (Unified) */}
                                    <div className="flex-1 md:flex-none text-center z-10 min-w-0 w-full">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{selectedCard.id}</span>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2 drop-shadow-md">{selectedCard.name}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <span>Market: <span className="text-white">{marketPriceLabel}</span></span>
                                            <span className="w-1 h-3 bg-white/10 rounded-full" />
                                            <span className={dailyDemand === 'High' ? 'text-emerald-500' : 'text-amber-500'}>{dailyDemand} Demand</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel (Form) - Unified Background */}
                                <div className="w-full md:w-[60%] bg-transparent p-5 md:p-8 md:pr-10 relative flex flex-col justify-center overflow-y-auto no-scrollbar">
                                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-600 hover:text-white transition-all z-30">
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="w-full max-w-sm mx-auto space-y-4 md:space-y-6">
                                        {showConfirm ? (
                                            // CONFIRMATION VIEW
                                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="text-center space-y-1 md:space-y-2">
                                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Verify Listing</h2>
                                                    <p className="text-slate-500 text-[10px] md:text-xs font-bold">Please review your transaction details.</p>
                                                </div>


                                                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
                                                        <div className="flex justify-between items-center text-sm font-bold border-b border-white/5 pb-3">
                                                            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Listing Price</span>
                                                            <span className="text-white font-mono text-lg">{currency === 'INR' ? '₹' : '$'}{parseFloat(price || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                                            <span className="uppercase tracking-wider text-[10px]">Platform Fee (3%)</span>
                                                            <span className="font-mono text-rose-400">-{currency === 'INR' ? '₹' : '$'}{Math.ceil((parseFloat(price || 0) * 0.03)).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Net Payout</span>
                                                            <span className="text-emerald-400 font-mono text-xl font-black">{currency === 'INR' ? '₹' : '$'}{Math.floor((parseFloat(price || 0) * 0.97)).toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Low Price Warning */}
                                                    {price && marketPriceDisplay > 0 && parseFloat(price) < marketPriceDisplay * 0.5 && (
                                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                                            <div className="space-y-1">
                                                                <h4 className="text-amber-500 font-black text-xs uppercase tracking-wide">Low Price Warning</h4>
                                                                <p className="text-amber-500/80 text-[10px] font-bold leading-relaxed">
                                                                    Your price is significantly below the estimated market value ({marketPriceLabel}). Are you sure?
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {error && (
                                                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-in shake">
                                                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                                            <p className="text-[10px] font-bold text-rose-400">{error}</p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3 pt-2">
                                                        <button 
                                                            onClick={handleFinalConfirm}
                                                            className="w-full py-4 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 border border-emerald-500/20 font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/10"
                                                        >
                                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm & List <ShieldCheck className="w-4 h-4" /></>}
                                                        </button>
                                                        <button 
                                                            onClick={() => setShowConfirm(false)}
                                                            disabled={loading}
                                                            className="w-full py-3 rounded-xl text-slate-500 hover:bg-slate-900 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all"
                                                        >
                                                            Back to Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // EDIT FORM VIEW
                                                <>
                                                    <div className="text-center md:text-left space-y-1 hidden md:block">
                                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Set Value</h2>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Live Confirmation
                                                        </div>
                                                    </div>

                                                    <form onSubmit={handleConfirm} className="space-y-4 md:space-y-6">
                                                        {/* App-Style Price Input */}
                                                        <div className="space-y-2 md:space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Listing Price</label>
                                                                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
                                                                    {['USD', 'INR'].map(c => (
                                                                        <button 
                                                                            key={c} type="button" onClick={() => { setCurrency(c); setPrice(''); }}
                                                                            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-[9px] md:text-[10px] font-black transition-all ${currency === c ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-400'}`}
                                                                        >{c}</button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="relative group">
                                                                <div className="absolute inset-0 bg-amber-500/0 group-focus-within:bg-amber-500/[0.02] blur-xl transition-all pointer-events-none" />
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl md:text-3xl font-black text-slate-700 group-focus-within:text-emerald-500/50 transition-colors pointer-events-none"> {currency === 'INR' ? '₹' : '$'} </span>
                                                                <input 
                                                                    type="number" required min="1" value={price} onChange={(e) => setPrice(e.target.value)}
                                                                    className={`w-full bg-slate-900/40 border rounded-xl py-3 md:py-4 pl-10 pr-10 text-3xl md:text-4xl font-black text-white focus:outline-none placeholder-slate-800 transition-all font-mono tracking-tight relative z-10 ${
                                                                        price && marketPriceDisplay > 0 && parseFloat(price) > marketPriceDisplay * 5 ? 'border-rose-500/50 focus:border-rose-500' :
                                                                        price && marketPriceDisplay > 0 && parseFloat(price) < marketPriceDisplay * 0.5 ? 'border-amber-500/50 focus:border-amber-500' :
                                                                        'border-white/10 group-focus-within:border-amber-500/30'
                                                                    }`}
                                                                    placeholder="0"
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-black text-slate-700 tracking-widest pointer-events-none">{currency}</span>
                                                            </div>

                                                            {/* App-Style Validation Feedback */}
                                                            {price && marketPriceDisplay > 0 && (
                                                                <div className="min-h-[1.5em]">
                                                                    {parseFloat(price) > marketPriceDisplay * 5 ? (
                                                                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 animate-in slide-in-from-top-1 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                            Price is very high. (You can still list, but check carefully)
                                                                        </p>
                                                                    ) : parseFloat(price) < marketPriceDisplay * 0.5 ? (
                                                                        <p className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5 animate-in slide-in-from-top-1 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                            Price is below 50% of market value.
                                                                        </p>
                                                                    ) : (
                                                                        <div className="flex justify-between items-center px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                                            <span>Platform Fee: 3%</span>
                                                                            <span>Net: <span className="text-emerald-400">₹{price ? Math.floor(price * 0.97).toLocaleString() : 0}</span></span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* App-Style Condition Selector (Compact) */}
                                                        <div className="space-y-2 md:space-y-3">
                                                            <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block">Condition</label>
                                                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                                                {['Mint', 'Near Mint', 'Played'].map((c) => {
                                                                    const active = condition === c;
                                                                    return (
                                                                        <button
                                                                            key={c} type="button" onClick={() => setCondition(c)}
                                                                            className={`py-3 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase border transition-all ${active ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white'}`}
                                                                        >
                                                                            {c === 'Near Mint' ? 'Excellent' : c}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {error && (
                                                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-in shake">
                                                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                                                <p className="text-[10px] font-bold text-rose-400">{error}</p>
                                                            </div>
                                                        )}

                                                        <button 
                                                            type="submit" 
                                                            disabled={loading || !price}
                                                            className="w-full py-4 md:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
                                                        >
                                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    // STEP 2: PROFESSIONAL SUCCESS
                    <div className="bg-slate-950 rounded-3xl border border-white/[0.08] p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden h-auto w-full max-w-md mx-auto justify-center animate-in zoom-in-95 duration-500 shadow-2xl">
                        <div className="absolute inset-0 bg-emerald-500/[0.02]" />
                        
                        <div className="relative z-10 w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6">
                             <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        
                        <div className="relative z-10 space-y-2 mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Listing Successful</h2>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-[260px] mx-auto">
                                Your asset <span className="text-white">{selectedCard?.name}</span> is now active on the marketplace.
                            </p>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="relative z-10 w-full py-3.5 rounded-xl bg-white text-slate-950 hover:bg-emerald-500 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-lg"
                        > Done </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingModal;
