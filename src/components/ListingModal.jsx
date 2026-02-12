import React, { useState } from 'react';
import { X, Upload, DollarSign, Info, ShieldCheck, ArrowRight, Camera } from 'lucide-react';
import { useUser } from '../context/UserContext';

const ListingModal = ({ isOpen, onClose, card }) => {
    const { user, openAuth } = useUser();
    const [price, setPrice] = useState(card?.price || '');
    const [condition, setCondition] = useState('Near Mint (NM)');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Success

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
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative">
                
                {step === 1 ? (
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Card Preview */}
                        <div className="w-full md:w-5/12 bg-slate-950 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                            <div className="relative group">
                                <img 
                                    src={card?.image || '/placeholder-card.png'} 
                                    className="w-48 h-64 object-contain rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500" 
                                    alt={card?.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 rounded-xl"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                     <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{card?.id}</div>
                                     <div className="text-sm font-black text-white uppercase tracking-tight truncate">{card?.name}</div>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-2 w-full">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Price</div>
                                    <div className="text-sm font-black text-white">${card?.price?.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">24h Vol</div>
                                    <div className="text-sm font-black text-white">${card?.volume}K</div>
                                </div>
                            </div>
                        </div>

                        {/* Listing Form */}
                        <div className="w-full md:w-7/12 p-8 relative">
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Sell Asset</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Set your terms for the global marketplace</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        <DollarSign className="w-3 h-3 text-emerald-500" /> Listing Price (USD)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            required
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 flex-1 text-center text-2xl font-black text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder-slate-800"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-black">USD</div>
                                    </div>
                                    <div className="flex justify-between px-2">
                                        <span className="text-[9px] font-bold text-slate-600 uppercase">Est. Net Profit: <span className="text-emerald-500">${(price * 0.97).toFixed(2)}</span></span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase">3% Marketplace Fee</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        Condition & Grade
                                    </label>
                                    <select 
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all"
                                    >
                                        <option>Gem Mint (PSA 10)</option>
                                        <option>Near Mint (NM)</option>
                                        <option>Excellent (EX)</option>
                                        <option>Lightly Played (LP)</option>
                                        <option>Moderately Played (MP)</option>
                                    </select>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                                        Listing this asset will make it visible to all traders on the platform. You can cancel your listing anytime from your Portfolio.
                                    </p>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 relative overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Deploy Listing <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-8 flex flex-col items-center">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-bounce">
                            <ShieldCheck className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Success!</h2>
                            <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                Your asset <span className="text-white font-bold">"{card?.name}"</span> has been deployed to the marketplace.
                            </p>
                        </div>
                        <div className="p-1 bg-slate-950 rounded-2xl border border-white/5 w-full max-w-xs overflow-hidden">
                             <div className="text-[9px] font-black text-slate-600 uppercase py-2 bg-white/5">Transaction Hash</div>
                             <div className="text-[10px] font-mono text-amber-500 py-3 px-4 break-all">
                                0x{Math.random().toString(16).slice(2, 10)}{Math.random().toString(16).slice(2, 10)}
                             </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingModal;
