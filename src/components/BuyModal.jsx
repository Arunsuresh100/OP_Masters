import React, { useState, useEffect } from 'react';
import { X, DollarSign, Info, ShieldCheck, ArrowRight, Wallet, CreditCard, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { USD_TO_INR } from '../constants';

const BuyModal = ({ isOpen, onClose, card }) => {
    const { user, openAuth } = useUser();
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Success
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [currency, setCurrency] = useState('inr');
    
    // Calculate Market Price in INR
    const marketPriceINR = card?.price ? card.price * USD_TO_INR : 0;

    useEffect(() => {
        if (isOpen && card) {
            const initialPrice = currency === 'inr' ? marketPriceINR : card.price || 0;
            setPrice(initialPrice.toFixed(2));
            setQuantity(1);
            setStep(1);
        }
    }, [card, isOpen, marketPriceINR, currency]);

    if (!isOpen) return null;

    if (!user) {
        return (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                        <Wallet className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Authorization Required</h2>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">
                            You must be a verified member of the Grand Line Exchange to accept trade contracts.
                        </p>
                    </div>
                    <button 
                        onClick={() => { onClose(); openAuth('login'); }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-500/20"
                    >
                        Sign In to Trade
                    </button>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // MOCK: Feature Coming Soon Mode
        // The user requested this feature to be "Coming Soon" for now.
        setLoading(true);
        setTimeout(() => {
            setStep(2); // Jump straight to "Coming Soon" screen
            setLoading(false);
        }, 800);

        /* 
        // Backend Logic (Disabled for Beta)
        try {
            const response = await fetch('http://localhost:3001/api/trade/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'buy',
                    card: card,
                    price: parseFloat(price),
                    quantity: quantity,
                    total: finalTotal,
                    currency: currency,
                    userEmail: user.email,
                    status: 'pending'
                })
            });

            const data = await response.json();
            if (response.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Purchase failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting purchase:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
        */
    };

    const totalCost = (Number(price) * quantity);
    const fee = totalCost * 0.02; // 2% Fee
    const finalTotal = totalCost + fee;

    const marketDiff = price && (currency === 'inr' ? marketPriceINR : card.price) > 0 
        ? ((price - (currency === 'inr' ? marketPriceINR : card.price)) / (currency === 'inr' ? marketPriceINR : card.price)) * 100 
        : 0;
    
    const currencySymbol = currency === 'inr' ? '₹' : '$';
    const currencyCode = currency === 'inr' ? 'INR' : 'USD';

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-transparent w-full max-w-4xl max-h-[95vh] shadow-2xl relative transition-all ${step === 2 ? 'max-w-lg' : ''}`}>
                
                {step === 1 ? (
                    <div className="flex flex-col w-full bg-slate-950 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl w-full max-w-sm md:max-w-lg mx-auto h-auto transition-all duration-300">
                        
                        {/* 1. TOP HEADER: Image (Left) + Details (Right) - COMPACT */}
                        <div className="w-full relative p-5 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-5 bg-gradient-to-b from-slate-900/60 to-transparent border-b border-white/5 shrink-0">
                            
                            {/* Close Button */}
                            <button onClick={onClose} className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-1.5 md:p-2 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 backdrop-blur-sm">
                                <X className="w-4 h-4" />
                            </button>

                            {/* Image Section */}
                            <div className="relative w-28 md:w-24 aspect-[2.5/3.5] shrink-0 group/card">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full opacity-40 group-hover/card:opacity-60 transition-opacity animate-pulse pointer-events-none" />
                                <img 
                                    src={card?.image || '/placeholder-card.png'} 
                                    className="w-full h-full object-cover rounded-xl shadow-2xl relative z-10 border border-white/10 group-hover/card:scale-105 transition-transform duration-500" 
                                    alt={card?.name}
                                />
                            </div>

                            {/* Details Section */}
                            <div className="flex-1 text-center md:text-left z-10 w-full pt-0.5">
                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{card?.id}</div>
                                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none mb-2 md:mb-3 drop-shadow-md">{card?.name}</h4>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                     <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Market</div>
                                        <div className="text-[10px] md:text-xs font-black text-white">₹{marketPriceINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Trend</div>
                                        <div className={`text-[10px] md:text-xs font-black ${card?.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{card?.change24h}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. BOTTOM BODY: Buy Form - COMPACT */}
                        <div className="w-full p-5 md:p-6 md:pt-4 relative flex flex-col bg-slate-950">
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Instant Buy
                                </div>
                                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
                                    {['inr', 'usd'].map((c) => (
                                        <button
                                            key={c} type="button" onClick={() => setCurrency(c)}
                                            className={`px-2 py-0.5 rounded md:rounded-md text-[8px] md:text-[9px] font-black uppercase transition-all ${currency === c ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        > {c} </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                                {/* Compact Row: Price & Quantity */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {/* Price Input */}
                                    <div className="space-y-1">
                                        <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Price</label>
                                        <div className="relative group">
                                            <input 
                                                type="number" required min="0" step="0.01" value={price}
                                                onChange={(e) => { const val = e.target.value; if (val === '' || parseFloat(val) >= 0) setPrice(val); }}
                                                className={`w-full bg-slate-900/40 border rounded-lg md:rounded-xl py-2.5 md:py-3 pl-7 pr-3 text-base md:text-lg font-black text-white focus:outline-none transition-all placeholder-slate-800 ${marketDiff > 5 ? 'border-rose-500/50 focus:border-rose-500' : marketDiff < -5 ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-amber-500/30'}`}
                                                placeholder="0.00"
                                            />
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-slate-600">{currencySymbol}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Quantity Input */}
                                    <div className="space-y-1">
                                        <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                        <div className="relative group flex items-center">
                                             <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-full text-slate-500 hover:text-white font-black z-10 transition-colors text-sm">-</button>
                                            <input 
                                                type="number" required min="1" value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full bg-slate-900/40 border border-white/10 rounded-lg md:rounded-xl py-2.5 md:py-3 px-8 text-center text-base md:text-lg font-black text-white focus:outline-none focus:border-amber-500/30 transition-all"
                                            />
                                            <button type="button" onClick={() => setQuantity(quantity + 1)} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-full text-slate-500 hover:text-white font-black z-10 transition-colors text-sm">+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total & Payment Row - Compact */}
                                <div className="flex flex-col md:flex-row gap-3 items-stretch">
                                    <div className="flex-1 bg-slate-900/30 rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/5 flex flex-col justify-center">
                                         <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase">Total ({quantity}x)</span>
                                            <span className="text-[9px] md:text-[10px] text-slate-400 font-mono">{currencySymbol}{fee.toFixed(2)} Fee</span>
                                        </div>
                                        <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">{currencySymbol}{finalTotal.toLocaleString(currency === 'inr' ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        {['wallet', 'card'].map(method => (
                                            <button 
                                                key={method} type="button" onClick={() => setPaymentMethod(method)}
                                                className={`px-1.5 py-2.5 rounded-lg md:rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${paymentMethod === method ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900'}`}
                                            >
                                                {method === 'wallet' ? <Wallet className={`w-3.5 h-3.5 ${paymentMethod === 'wallet' ? 'text-emerald-500' : 'text-slate-500'}`} /> : <CreditCard className={`w-3.5 h-3.5 ${paymentMethod === 'card' ? 'text-emerald-500' : 'text-slate-500'}`} />}
                                                <span className={`text-[8px] font-black uppercase tracking-wide ${paymentMethod === method ? 'text-white' : 'text-slate-500'}`}>{method}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 animate-in shake">
                                        <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                        <p className="text-[8px] md:text-[9px] font-bold text-rose-400">{error}</p>
                                    </div>
                                )}

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-3 md:py-3.5 rounded-lg md:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm Order <ArrowRight className="w-3.5 h-3.5" /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 p-16 text-center space-y-8 flex flex-col items-center relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/10 mb-2">
                             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
                             <Wallet className="w-10 h-10 text-slate-300" />
                        </div>

                        <div className="relative z-10 space-y-4 max-w-md">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Feature Coming Soon</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                The <span className="text-emerald-500 font-bold">Trading Engine</span> is currently in development.
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                                You'll soon be able to buy assets instantly or place limit orders directly from this interface.
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

export default BuyModal;
