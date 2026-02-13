import React, { useState, useEffect } from 'react';
import { X, DollarSign, Info, ShieldCheck, ArrowRight, Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { USD_TO_INR } from '../constants';

const BuyModal = ({ isOpen, onClose, card }) => {
    const { user, openAuth } = useUser();
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Success
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
                    status: 'active'
                })
            });

            if (response.ok) {
                setStep(2);
            } else {
                console.error('Purchase failed');
            }
        } catch (error) {
            console.error('Error submitting purchase:', error);
        } finally {
            setLoading(false);
        }
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
                    <div className="flex flex-col md:flex-row h-full max-h-[95vh] rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden">
                        {/* Left Panel: Card Preview & Stats */}
                        <div className="w-full md:w-5/12 bg-slate-950 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative shrink-0">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 md:mb-4 text-center w-full">Asset Details</h3>
                            
                            <div className="flex-1 flex flex-col items-center justify-center relative w-full my-2 md:my-0">
                                <div className="relative group w-24 md:w-40 aspect-[2.5/3.5] mx-auto">
                                    <img 
                                        src={card?.image || '/placeholder-card.png'} 
                                        className="w-full h-full object-cover rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] md:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 group-hover:border-emerald-500/30 transition-all duration-500" 
                                        alt={card?.name}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-slate-950 to-transparent rounded-b-xl">
                                         <div className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{card?.id}</div>
                                         <div className="text-[10px] md:text-xs font-black text-white uppercase tracking-tight truncate">{card?.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 md:mt-4 grid grid-cols-2 gap-2 w-full">
                                <div className="p-2 md:p-3 bg-slate-900/50 rounded-lg md:rounded-xl border border-white/5 text-center md:text-left">
                                    <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Market Price</div>
                                    <div className="text-xs md:text-sm font-black text-white">₹{marketPriceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                </div>
                                <div className="p-2 md:p-3 bg-slate-900/50 rounded-lg md:rounded-xl border border-white/5 text-center md:text-left">
                                    <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">24h Trend</div>
                                    <div className={`text-xs md:text-sm font-black flex items-center justify-center md:justify-start gap-1 ${card?.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {Math.abs(card?.change24h || 0)}%
                                        {card?.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Buy Form */}
                        <div className="w-full md:w-7/12 p-4 md:p-6 relative bg-slate-900 flex flex-col justify-center overflow-y-auto">
                            <button onClick={onClose} className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10">
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-1">Buy Asset</h2>
                            <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-5 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Instant Execution Available
                                </span>
                                <div className="flex bg-slate-950 rounded-lg p-0.5 border border-white/5">
                                    {['inr', 'usd'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCurrency(c)}
                                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                                                currency === c 
                                                    ? 'bg-amber-500 text-slate-950 shadow-lg' 
                                                    : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
                                {/* Price & Quantity Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Buy Price ({currencyCode})</label>
                                        <div className="relative group">
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || parseFloat(val) >= 0) {
                                                        setPrice(val);
                                                    }
                                                }}
                                                className={`w-full bg-slate-950 border-2 rounded-xl py-3 md:py-4 pl-8 pr-4 text-base md:text-lg font-black text-white focus:outline-none transition-all placeholder-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                                    marketDiff > 5 ? 'border-red-500/50 focus:border-red-500' : 
                                                    marketDiff < -5 ? 'border-emerald-500/50 focus:border-emerald-500' : 
                                                    'border-white/5 focus:border-white/20'
                                                }`}
                                                placeholder="0.00"
                                            />
                                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black transition-colors ${
                                                marketDiff > 5 ? 'text-red-500/50' : 
                                                marketDiff < -5 ? 'text-emerald-500/50' : 
                                                'text-slate-600'
                                            }`}>{currencySymbol}</span>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">{currencyCode}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                        <div className="relative group">
                                             <button 
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors"
                                             >-</button>
                                            <input 
                                                type="number" 
                                                required
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full bg-slate-950 border-2 border-white/5 rounded-xl py-3 md:py-4 px-12 text-center text-base md:text-lg font-black text-white focus:outline-none focus:border-white/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors"
                                             >+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                 <div className="bg-slate-950/50 rounded-2xl p-6 space-y-3 border border-white/5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-wide">Subtotal</span>
                                        <span className="text-slate-300 font-mono font-bold">{currencySymbol}{(Number(price) * quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-wide">Platform Fee (2%)</span>
                                        <span className="text-slate-300 font-mono font-bold">{currencySymbol}{fee.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-black uppercase tracking-widest text-xs">Total Cost</span>
                                        <span className="text-xl font-black text-emerald-400 font-mono">{currencySymbol}{finalTotal.toLocaleString(currency === 'inr' ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {/* Payment Method (Mock) */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setPaymentMethod('wallet')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                                                paymentMethod === 'wallet' 
                                                ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                                                : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-emerald-500' : 'text-slate-500'}`} />
                                                <span className="text-xs font-black uppercase tracking-wide">Wallet</span>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-80 pl-8">Bal: ₹24,500.00</div>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                                                paymentMethod === 'card' 
                                                ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                                                : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-emerald-500' : 'text-slate-500'}`} />
                                                <span className="text-xs font-black uppercase tracking-wide">Card</span>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-80 pl-8">**** 4242</div>
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group/btn"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Confirm Purchase <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                                    )}
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
