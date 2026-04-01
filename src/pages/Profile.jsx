import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useSupport } from '../context/SupportContext';
import SupportTicketModal from '../components/SupportTicketModal';
import { 
  Camera, Mail, Calendar, ShoppingBag, TrendingUp, TrendingDown, 
  Shield, DollarSign, Activity, ArrowUpRight, ArrowDownRight, 
  Wallet, History, Tag, ChevronRight, LayoutDashboard, Settings, 
  HelpCircle, Package, ExternalLink, Info, Heart, Search, Filter, 
  User, CheckCircle2, AlertCircle, Plus, Minus, X
} from 'lucide-react';
import { formatPrice } from '../utils';
import { USD_TO_INR, RARITIES } from '../constants';

// Helper for deterministic pseudo-random values (0.8 to 1.5)
const getDeterministicChange = (cardId, userEmail) => {
    const seed = `${cardId}-${userEmail || 'guest'}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const absHash = Math.abs(hash);
    return 0.8 + ((absHash % 70) / 100);
};

const getCardImageUrl = (url) => {
  if (!url) return '';
  return `${import.meta.env.VITE_API_URL}/api/card-image?url=${encodeURIComponent(url)}`;
};

// Character Avatars
import luffyImg from '../assets/luffy.png';
import zoroImg from '../assets/zoro.png';
import sanjiImg from '../assets/sanji.png';
import usoppImg from '../assets/Usopp.png';
import brookImg from '../assets/brook.png';

const CHARACTER_AVATARS = [
    { id: 'luffy', name: 'Monkey D. Luffy', role: 'Captain', image: luffyImg },
    { id: 'zoro', name: 'Roronoa Zoro', role: 'Swordsman', image: zoroImg },
    { id: 'sanji', name: 'Sanji', role: 'Cook', image: sanjiImg },
    { id: 'usopp', name: 'Usopp', role: 'Sniper', image: usoppImg },
    { id: 'brook', name: 'Brook', role: 'Musician', image: brookImg }
];

const Profile = () => {
    const { 
        user, updateAvatar, getTransactions, 
        wishlist, toggleWishlist, 
        ownedCards, updateOwnedCard 
    } = useUser();
    const [allCards, setAllCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [activeTab, setActiveTab] = useState('vault');
    const [currency, setCurrency] = useState('INR');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [vaultFilter, setVaultFilter] = useState('all');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user?.name || user?.username || '');
    
    const { updateName } = useUser();
    
    const { getUserTickets } = useSupport();
    const userTickets = user ? getUserTickets(user.email) : [];

    // Fetch all cards for Vault selection
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cards`);
                const data = await response.json();
                setAllCards(data);
            } catch (err) {
                console.error("Error fetching cards for vault:", err);
            } finally {
                setLoadingCards(false);
            }
        };
        fetchCards();
    }, []);

    // Portfolio Worth Calculation
    const portfolioStats = useMemo(() => {
        let totalWorth = 0;
        let totalChange = 0;
        let ownedCount = 0;

        allCards.forEach(card => {
            const qty = ownedCards[card.id] || 0;
            if (qty > 0) {
                const price = card.priceEnglish || 50; 
                const worth = qty * price;
                const change = getDeterministicChange(card.id, user?.email) - 1;
                
                totalWorth += worth;
                totalChange += worth * change;
                ownedCount += qty;
            }
        });

        const percentChange = totalWorth > 0 ? (totalChange / totalWorth) * 100 : 0;
        return { totalWorth, percentChange, ownedCount };
    }, [allCards, ownedCards, user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                    <Shield className="w-10 h-10 text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Identity Required</h2>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-bold">Please authenticate to access your personal secure dashboard.</p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))} className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Log In / Sign Up</button>
            </div>
        );
    }

    const currentAvatar = CHARACTER_AVATARS.find(a => a.id === (user.selectedAvatar || 'luffy')) || CHARACTER_AVATARS[0];


    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-12 sm:pt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* 1. Dashboard Header (Condensed & High Impact) */}
                <div className="relative mb-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 p-[2px] border border-white/10 overflow-hidden transition-transform group-hover:scale-105 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img src={currentAvatar.image} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    className="absolute bottom-0 right-0 p-2 bg-white text-slate-950 rounded-full shadow-2xl hover:scale-110 transition-all border border-white/10 z-10"
                                >
                                    <Camera className="w-3 h-3.5" />
                                </button>
                            </div>
                            <div>
                                <div className="flex flex-col gap-1 mb-2">
                                    {isEditingName ? (
                                        <input 
                                            type="text" 
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => { setIsEditingName(false); if(tempName.trim()) updateName(tempName); }}
                                            onKeyDown={(e) => { if(e.key === 'Enter') { setIsEditingName(false); if(tempName.trim()) updateName(tempName); }}}
                                            autoFocus
                                            className="bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic focus:outline-none focus:border-amber-500/50 w-full max-w-xs"
                                        />
                                    ) : (
                                        <h1 
                                            onClick={() => setIsEditingName(true)}
                                            className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic cursor-pointer hover:text-amber-500 transition-colors flex items-center gap-3 group/name"
                                        >
                                            {user.name || user.username}
                                            <Settings className="w-4 h-4 opacity-0 group-hover/name:opacity-50" />
                                        </h1>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-1.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                                        <Mail className="w-3 h-3 text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
                            <div className="flex-1 lg:flex-none p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Estimated Vault Value</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none tracking-tighter">
                                        {formatPrice(portfolioStats.totalWorth, currency, USD_TO_INR)}
                                    </span>
                                    <span className={`text-[10px] font-black pb-1 ${portfolioStats.percentChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {portfolioStats.percentChange >= 0 ? '+' : ''}{portfolioStats.percentChange.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex lg:flex-col gap-2">
                                <button onClick={() => setCurrency('USD')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${currency === 'USD' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-500 border border-white/5'}`}>USD</button>
                                <button onClick={() => setCurrency('INR')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${currency === 'INR' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-500 border border-white/5'}`}>INR</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Selector Panel */}
                {showAvatarSelector && (
                    <div className="mb-10 p-8 bg-slate-900 border border-white/5 rounded-[2rem] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                             <h3 className="text-base font-black text-white uppercase tracking-widest italic">Character Identity Selector</h3>
                             <button onClick={() => setShowAvatarSelector(false)} className="text-slate-500 hover:text-white uppercase text-[10px] font-black italic">Dismiss</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {CHARACTER_AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => { updateAvatar(avatar.id); setShowAvatarSelector(false); }}
                                    className={`group relative p-4 rounded-2xl border transition-all ${user.selectedAvatar === avatar.id ? 'bg-amber-500 border-amber-500' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-slate-950 shadow-inner group-hover:scale-105 transition-transform">
                                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-[10px] font-black uppercase tracking-tight ${user.selectedAvatar === avatar.id ? 'text-white' : 'text-slate-400'}`}>{avatar.name.split(' ').pop()}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Command Dashboard Layout */}
                <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Navigation Rail */}
                    <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-32">
                        {[
                            { id: 'vault', label: 'My Vault', icon: Package, count: portfolioStats.ownedCount },
                            { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
                            { id: 'history', label: 'Activity', icon: History, count: null },
                            { id: 'support', label: 'Support', icon: HelpCircle, count: userTickets.length },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-4.5 px-6 rounded-2xl border transition-all ${
                                    activeTab === item.id 
                                        ? 'bg-white border-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.05)]' 
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-4.5 h-4.5" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                {item.count !== null && item.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                                        activeTab === item.id ? 'bg-slate-900 text-white' : 'bg-white/5 text-slate-400'
                                    }`}>{item.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Stage */}
                    <div className="lg:col-span-9">
                        
                        {/* TAB: THE VAULT (Collection Manager - Simplified to Owned Items) */}
                        {activeTab === 'vault' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {portfolioStats.ownedCount === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                                        <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Package className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Vault is Empty</h3>
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">You haven't listed any digital assets in your personal vault yet.</p>
                                        <button onClick={() => window.location.href='/cards'} className="px-10 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">Discover Cards</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                        {allCards.filter(card => (ownedCards[card.id] || 0) > 0).map((card) => {
                                            const qty = ownedCards[card.id] || 0;
                                            const cardWorth = (card.priceEnglish || 50) * qty;
                                            return (
                                                <div 
                                                    key={card.id} 
                                                    className="group relative flex flex-col p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border bg-white/[0.02] border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl hover:-translate-y-2"
                                                >
                                                    <div className="relative aspect-[1/1.4] rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden mb-5 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                                                        <img 
                                                            src={getCardImageUrl(card.image)} 
                                                            alt={card.name} 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                            <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                                            <span className="text-[7px] font-black text-white uppercase tracking-widest">Rate {formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</span>
                                                        </div>
                                                        <div className="absolute bottom-2 right-2 bg-white text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xl">
                                                            <span className="text-[10px] font-black leading-none">{qty}</span>
                                                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-50">Units</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="px-1 flex flex-col h-full">
                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <h4 className="text-[11px] sm:text-[12px] font-black text-white uppercase tracking-tight line-clamp-1">{card.name}</h4>
                                                        </div>
                                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Worth: <span className="text-white">{formatPrice(cardWorth, currency, USD_TO_INR)}</span></div>
                                                        
                                                        <div className="mt-auto flex items-center gap-2">
                                                            <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-black/60 border border-white/5 rounded-xl">
                                                                <button onClick={() => updateOwnedCard(card.id, qty - 1)} className="p-1 text-slate-500 hover:text-rose-500 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                                <span className="text-[9px] font-black text-white font-mono">{qty}</span>
                                                                <button onClick={() => updateOwnedCard(card.id, qty + 1)} className="p-1 text-slate-500 hover:text-emerald-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                            <button 
                                                                onClick={() => updateOwnedCard(card.id, 0)}
                                                                className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: WISHLIST HUB */}
                        {activeTab === 'wishlist' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                {wishlist.length === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                                        <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Heart className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Watchlist Static</h3>
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">Save upcoming assets to monitor their daily valuation metrics.</p>
                                        <button onClick={() => window.location.href='/marketplace'} className="px-10 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Open Marketplace</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {allCards.filter(c => wishlist.includes(c.id)).map(card => (
                                            <div key={card.id} className="group relative bg-white/[0.02] border border-white/10 p-5 rounded-[2.5rem] hover:border-amber-500/30 transition-all duration-500 flex items-center gap-5 overflow-hidden shadow-2xl">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
                                                <div className="w-20 h-28 rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-2xl border border-white/5">
                                                    <img src={getCardImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="flex-1 py-1 relative z-10 min-w-0">
                                                    <div className="text-[7px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 opacity-60 line-clamp-1">{card.id}</div>
                                                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-4 line-clamp-1">{card.name}</h4>
                                                    
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Market Rate</div>
                                                            <div className="text-[10px] font-black text-white font-mono tracking-tighter">{formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => toggleWishlist(card.id)}
                                                            className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 group/x"
                                                        >
                                                            <X className="w-3.5 h-3.5 group-hover/x:rotate-90 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: ACTIVITY Log (Trade History Split-Sector) */}
                        {activeTab === 'history' && (
                             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                {getTransactions().length === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                                        <History className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">No digital records found for active session</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-12">
                                        {/* ACQUISITIONS (BUYING) */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl">
                                            <div className="p-6 sm:p-8 border-b border-white/5 bg-black/40 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-widest italic leading-none mb-1">Acquisitions</h3>
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Asset Inflow History</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-black/20 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">
                                                            <th className="py-5 px-6 sm:px-10">Record ID</th>
                                                            <th className="py-5 px-6 sm:px-10">Asset Detail</th>
                                                            <th className="py-5 px-6 sm:px-10 text-right">Settlement</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {getTransactions('buy').map((tx) => (
                                                            <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                                                <td className="py-5 px-6 sm:px-10 text-[10px] font-mono text-slate-600 uppercase italic opacity-60 group-hover:opacity-100 transition-opacity">#{tx.id.toString().slice(-8)}</td>
                                                                <td className="py-5 px-6 sm:px-10">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-8 h-10 rounded bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                                                            <img src={getCardImageUrl(tx.card.image)} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <span className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{tx.card.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-5 px-6 sm:px-10 text-right font-black font-mono text-emerald-400 tracking-widest text-sm whitespace-nowrap">{formatPrice(tx.total, currency, USD_TO_INR)}</td>
                                                            </tr>
                                                        ))}
                                                        {getTransactions('buy').length === 0 && (
                                                            <tr><td colSpan="3" className="py-12 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">No Acquisitions Recorded</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* LIQUIDATIONS (SELLING) */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl">
                                            <div className="p-6 sm:p-8 border-b border-white/5 bg-black/40 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                        <ArrowUpRight className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-widest italic leading-none mb-1">Liquidations</h3>
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Asset Outflow History</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-black/20 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">
                                                            <th className="py-5 px-6 sm:px-10">Record ID</th>
                                                            <th className="py-5 px-6 sm:px-10">Asset Detail</th>
                                                            <th className="py-5 px-6 sm:px-10 text-right">Settlement</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {getTransactions('sell').map((tx) => (
                                                            <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                                                <td className="py-5 px-6 sm:px-10 text-[10px] font-mono text-slate-600 uppercase italic opacity-60 group-hover:opacity-100 transition-opacity">#{tx.id.toString().slice(-8)}</td>
                                                                <td className="py-5 px-6 sm:px-10">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-8 h-10 rounded bg-black overflow-hidden flex-shrink-0 border border-white/5">
                                                                            <img src={getCardImageUrl(tx.card.image)} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <span className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{tx.card.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-5 px-6 sm:px-10 text-right font-black font-mono text-amber-400 tracking-widest text-sm whitespace-nowrap">{formatPrice(tx.total, currency, USD_TO_INR)}</td>
                                                            </tr>
                                                        ))}
                                                        {getTransactions('sell').length === 0 && (
                                                            <tr><td colSpan="3" className="py-12 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">No Liquidations Recorded</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        )}

                        {/* TAB: SUPPORT (Integrated Terminal Form) */}
                        {activeTab === 'support' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                                    {/* Direct Transmission Form */}
                                    <div className="xl:col-span-3 bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-5 mb-10">
                                                <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                                    <Mail className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-1.5">Direct Transmission</h3>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-60">Secure Admin Uplink</p>
                                                </div>
                                            </div>

                                            <form className="space-y-8" onSubmit={(e) => {
                                                e.preventDefault();
                                                const formData = new FormData(e.target);
                                                createTicket({
                                                    userEmail: user.email,
                                                    subject: formData.get('subject'),
                                                    message: formData.get('message'),
                                                    priority: formData.get('priority'),
                                                    category: 'General Inquiry'
                                                });
                                                alert('Transmission Finalized. Admin decryption pending.');
                                                e.target.reset();
                                            }}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Priority Protocol</label>
                                                        <select name="priority" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all uppercase appearance-none cursor-pointer">
                                                            <option value="low">Standard Activity</option>
                                                            <option value="high">Urgent Protocol</option>
                                                            <option value="critical">Critical Anomaly</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Transmission Subject</label>
                                                        <input name="subject" required type="text" placeholder="Identify Subject..." className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Encrypted Log Entry</label>
                                                    <textarea name="message" required rows="5" placeholder="Input transmission parameters..." className="w-full bg-slate-950/50 border border-white/5 rounded-[2rem] px-6 py-6 text-xs font-black text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"></textarea>
                                                </div>
                                                <button type="submit" className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:bg-amber-400 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 group/send">
                                                    Engage Transmission
                                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Connection Feed (Response Stream) */}
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between mb-4 px-4">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Feeds</h3>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        
                                        <div className="space-y-6 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                                            {userTickets.length === 0 ? (
                                                <div className="p-16 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem] text-slate-700 text-[10px] font-black uppercase italic tracking-[0.2em]">
                                                    No ongoing transmissions detected
                                                </div>
                                            ) : (
                                                userTickets.map((ticket) => (
                                                    <div key={ticket.id} className="p-8 bg-white/[0.02] border border-white/10 rounded-[3rem] hover:border-amber-500/20 transition-all duration-500 group relative">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{ticket.status}</span>
                                                        </div>
                                                        <h4 className="text-[13px] font-black text-white uppercase tracking-tight mb-3 group-hover:text-amber-500 transition-colors line-clamp-1">{ticket.subject}</h4>
                                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest line-clamp-3 leading-relaxed italic">{ticket.message}</p>
                                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                                            <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Hash #{ticket.id.toString().slice(-6)}</span>
                                                            <button className="text-[8px] font-black text-amber-500/50 hover:text-amber-500 uppercase tracking-widest transition-colors">Decrypt Thread</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SupportTicketModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
        </div>
    );
};

export default Profile;

