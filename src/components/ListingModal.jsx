import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, DollarSign, Info, ShieldCheck, ArrowRight, Camera, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';

import { USD_TO_INR } from '../constants';

const ListingModal = ({ isOpen, onClose, card }) => {
    const { user, openAuth } = useUser();
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'ar Mint');
    const [condition, setCondition] = useState('Near Mint');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Success


    // Mock Portfolio for "Select Card" feature
    const mockPortfolio = [
        card,
        { ...card, id: 'OP05-060', name: 'Monkey.D.Luffy (Gear 5)', price: 145.50, image: 'https://tcgplayer-cdn.tcgplayer.com/product/528672_in_600x600.jpg', volume: 120 },
        { ...card, id: 'OP01-002', name: 'Trafalgar Law', price: 45.20, image: 'https://tcgplayer-cdn.tcgplayer.com/product/454556_in_600x600.jpg', volume: 85 }
    ].filter(Boolean);

    const [selectedCard, setSelectedCard] = useState(card || mockPortfolio[0]);

    // Calculate Market Price based on selected currency
    const marketPriceDisplay = selectedCard?.price ? (currency === 'INR' ? selectedCard.price * USD_TO_INR : selectedCard.price) : 0;
    const marketPriceLabel = currency === 'INR' ? `₹${marketPriceDisplay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${marketPriceDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPrice('');
            setLoading(false);
            setCurrency('INR'); // Reset currency on open
            document.body.style.overflow = 'hidden'; // Lock scroll
        } else {
            document.body.style.overflow = 'unset'; // Unlock scroll
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (card) setSelectedCard(card);
    }, [card]);



    // Dynamic Daily Demand Logic
    const dailyDemand = useMemo(() => {
        if (!selectedCard) return 'Medium';
        const price = selectedCard.price || 0;
        if (price > 100) return 'High'; // e.g. > $100 or ~8000 INR
        if (price > 20) return 'Medium';
        return 'Low';
    }, [selectedCard]);

    if (!isOpen) return null;

    if (!user) {
        return (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                        <ShieldCheck className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Authorization Required</h2>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">
                            You must be a verified member of the Grand Line Exchange to list assets for sale.
                        </p>
                    </div>
                    <button 
                        onClick={() => { onClose(); openAuth('login'); }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-500/20"
                    >
                        Sign In to Continue
                    </button>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                        Maybe Later
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock Listing Logic
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const marketDiff = price && marketPriceDisplay > 0 ? ((parseFloat(price) - marketPriceDisplay) / marketPriceDisplay) * 100 : 0;
    
    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-transparent w-full max-w-4xl max-h-[95vh] shadow-2xl relative transition-all ${step === 2 ? 'max-w-lg' : ''}`}>
                
                {step === 1 ? (
                    <div className="flex flex-col md:flex-row h-full max-h-[95vh] rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden">
                        {/* Left Panel: Card Selector & Preview */}
                        <div className="w-full md:w-5/12 bg-slate-950 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative shrink-0">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 md:mb-4 text-center w-full">Select Asset</h3>
                            
                            {/* Card Carousel (Mock) */}
                            <div className="flex-1 flex flex-col items-center justify-center relative w-full my-2 md:my-0">
                                <div className="relative group w-24 md:w-40 aspect-[2.5/3.5] mx-auto">
                                    <img 
                                        src={selectedCard?.image || '/placeholder-card.png'} 
                                        className="w-full h-full object-cover rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] md:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 group-hover:border-amber-500/30 transition-all duration-500" 
                                        alt={selectedCard?.name}
                                    />
                                    {/* Overlay for Mock Selection */}
                                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-slate-950 to-transparent rounded-b-xl">
                                         <div className="text-[8px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5">{selectedCard?.id}</div>
                                         <div className="text-[10px] md:text-xs font-black text-white uppercase tracking-tight truncate">{selectedCard?.name}</div>
                                    </div>
                                    
                                    {/* Mock Navigation Arrows */}
                                    <button className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:border-amber-500 transition-all z-20" onClick={() => {
                                        const idx = mockPortfolio.findIndex(c => c.id === selectedCard.id);
                                        const prev = mockPortfolio[(idx - 1 + mockPortfolio.length) % mockPortfolio.length];
                                        setSelectedCard(prev);
                                        setPrice(''); 
                                    }}>
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                    <button className="absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:border-amber-500 transition-all z-20" onClick={() => {
                                        const idx = mockPortfolio.findIndex(c => c.id === selectedCard.id);
                                        const next = mockPortfolio[(idx + 1) % mockPortfolio.length];
                                        setSelectedCard(next);
                                        setPrice(''); 
                                    }}>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 md:mt-4 grid grid-cols-2 gap-2 w-full">
                                <div className="p-2 md:p-3 bg-slate-900/50 rounded-lg md:rounded-xl border border-white/5 text-center md:text-left">
                                    <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Market Price ({currency})</div>
                                    <div className="text-xs md:text-sm font-black text-white">{marketPriceLabel}</div>
                                </div>
                                <div className="p-2 md:p-3 bg-slate-900/50 rounded-lg md:rounded-xl border border-white/5 text-center md:text-left">
                                    <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Daily Demand</div>
                                    <div className={`text-xs md:text-sm font-black flex items-center justify-center md:justify-start gap-1 ${
                                        dailyDemand === 'High' ? 'text-emerald-500' : 
                                        dailyDemand === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                                    }`}>
                                        {dailyDemand === 'High' ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : null}
                                        {dailyDemand}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Listing Form */}
                        <div className="w-full md:w-7/12 p-4 md:p-6 relative bg-slate-900 flex flex-col justify-center overflow-y-auto">
                            <button onClick={onClose} className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10">
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-1">Sell Asset</h2>
                            <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Marketplace Listing
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
                                {/* Price Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            List Price ({currency})
                                        </label>
                                        {/* Currency Toggle */}
                                        <div className="flex bg-slate-900 rounded-lg p-1 gap-1 border border-white/10">
                                            <button 
                                                type="button"
                                                onClick={() => { setCurrency('USD'); setPrice(''); }}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
                                                }`}
                                            >
                                                USD
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setCurrency('INR'); setPrice(''); }}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    currency === 'INR' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
                                                }`}
                                            >
                                                INR
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <span className={`absolute left-6 top-1/2 -translate-y-1/2 text-lg font-bold transition-colors ${
                                            marketDiff > 20 ? 'text-amber-500/50' : 
                                            marketDiff < -20 ? 'text-blue-500/50' : 
                                            'text-slate-500 group-focus-within:text-emerald-500'
                                        }`}>
                                            {currency === 'INR' ? '₹' : '$'}
                                        </span>
                                        <input 
                                            type="number" 
                                            required
                                            min="0"
                                            value={price}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || parseFloat(val) >= 0) {
                                                    setPrice(val);
                                                }
                                            }}
                                            className={`w-full bg-slate-950 border-2 rounded-xl py-3 md:py-4 pl-10 md:pl-12 pr-6 text-xl md:text-2xl font-black text-white focus:outline-none transition-all placeholder-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                                marketDiff > 20 ? 'border-amber-500/50 focus:border-amber-500' : 
                                                marketDiff < -20 ? 'border-blue-500/50 focus:border-blue-500' : 
                                                'border-white/5 focus:border-white/20'
                                            }`}
                                            placeholder={currency === 'INR' ? "0" : "0.00"}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-600">{currency}</span>
                                    </div>
                                    
                                    {/* Price Validation Message */}
                                    {price && (marketDiff > 20 || marketDiff < -20) && (
                                        <div className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 px-3 py-2 rounded-lg ${
                                            marketDiff > 20 ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            <Info className="w-3 h-3" />
                                            {marketDiff > 20 ? 'Price is significantly above market rate.' : 'Price is significantly below market rate.'}
                                        </div>
                                    )}
                               
                                    <div className="flex justify-between px-2 pt-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Est. Net Profit: <span className="text-emerald-500 font-mono">₹{(price * 0.97).toFixed(2)}</span></span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase">3% Fee</span>
                                    </div>
                                </div>

                                {/* Condition Selection (Radio Style) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        <Camera className="w-3 h-3 text-slate-400" /> Condition
                                    </label>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Mint', 'Near Mint', 'Played'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setCondition(c)}
                                                className={`py-2 md:py-2.5 px-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                                                    condition === c 
                                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20' 
                                                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20 hover:text-white'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group/btn mt-4 md:mt-5"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Confirm Sell Order <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 p-16 text-center space-y-8 flex flex-col items-center relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/10 mb-2">
                             <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute"></div>
                             <Info className="w-10 h-10 text-slate-300" />
                        </div>

                        <div className="relative z-10 space-y-4 max-w-md">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Feature Coming Soon</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                The <span className="text-amber-500 font-bold">Seller Dashboard</span> is currently in development.
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                                You'll soon be able to list assets, track sales performance, and manage your portfolio directly from this interface.
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="relative z-10 px-10 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest hover:border-white/20"
                        >
                            Return to Marketplace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingModal;
