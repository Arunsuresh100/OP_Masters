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

    const [marketMetadata, setMarketMetadata] = useState(null);

    // Fetch all cards for Vault selection
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cards`);
                const data = await response.json();
                
                if (data.cards) {
                    setAllCards(data.cards);
                    setMarketMetadata({
                        last_synced_at: data.last_synced_at,
                        source: data.source
                    });
                } else {
                    setAllCards(data);
                }
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
                // Use live market price based on secondary currency preference if needed, 
                // but usually portfolio BASE is USD/INR relative.
                // We'll use priceEnglish as the global baseline for worth.
                const price = card.priceEnglish || 0; 
                const worth = qty * price;
                
                // Use real percentChange from bridge if available
                const change = (card.percentChange || 0) / 100;
                
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
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
                                        {allCards.filter(card => (ownedCards[card.id] || 0) > 0).map((card) => {
                                            const qty = ownedCards[card.id] || 0;
                                            const cardWorth = (card.priceEnglish || 50) * qty;
                                            return (
                                                <div 
                                                    key={card.id} 
                                                    className="group relative flex flex-col bg-slate-900 border border-white/5 rounded-[15px] overflow-hidden hover:border-white/20 transition-all duration-700 shadow-[0_30px_100px_rgba(0,0,0,0.8)] hover:-translate-y-2"
                                                >
                                                    {/* Background Glow */}
                                                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                                    
                                                    {/* Asset Case (Image Container) */}
                                                    <div className="relative aspect-[0.7/1] sm:aspect-[1/1.4] overflow-hidden rounded-t-[15px]">
                                                        <img 
                                                            src={getCardImageUrl(card.image)} 
                                                            alt={card.name} 
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                        />
                                                        
                                                        {/* Digital Status Overlays */}
                                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                            <div className="px-3 py-1.5 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2 shadow-2xl">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="absolute top-4 right-4 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                            <div className="w-12 h-12 bg-white text-slate-950 rounded-2xl flex flex-col items-center justify-center shadow-2xl">
                                                                <span className="text-[14px] font-black leading-none">{qty}</span>
                                                                <span className="text-[7px] font-black uppercase tracking-tighter opacity-50">Units</span>
                                                            </div>
                                                        </div>

                                                        {/* Integrated Valuation (Bottom of Image) */}
                                                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                            <div className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 opacity-60">{card.id}</div>
                                                            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight line-clamp-1 mb-2 italic">{card.name}</h4>
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Worth</div>
                                                                <div className="text-xs font-black text-white font-mono tracking-tighter">{formatPrice(cardWorth, currency, USD_TO_INR)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Control Console (Static at Bottom) */}
                                                    <div className="p-3 bg-black/40 border-t border-white/5 flex items-center gap-3">
                                                        <div className="flex-1 flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-xl">
                                                            <button onClick={() => updateOwnedCard(card.id, qty - 1)} className="p-1 text-slate-600 hover:text-rose-500 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                            <span className="text-xs font-black text-white font-mono">{qty}</span>
                                                            <button onClick={() => updateOwnedCard(card.id, qty + 1)} className="p-1 text-slate-600 hover:text-emerald-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                        <button 
                                                            onClick={() => updateOwnedCard(card.id, 0)}
                                                            className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {allCards.filter(c => wishlist.includes(c.id)).map(card => (
                                            <div key={card.id} className="group relative bg-white/[0.01] border border-white/10 p-4 rounded-[15px] hover:border-amber-500/30 transition-all duration-700 flex items-center gap-6 overflow-hidden shadow-2xl hover:bg-white/[0.03]">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                                                <div className="w-24 h-32 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-black flex-shrink-0 shadow-2xl border border-white/5">
                                                    <img src={getCardImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                                </div>
                                                <div className="flex-1 py-1 relative z-10 min-w-0">
                                                    <div className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1.5 opacity-60 line-clamp-1">{card.id}</div>
                                                    <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight mb-6 line-clamp-2 leading-tight italic">{card.name}</h4>
                                                    
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Market Equilibrium</div>
                                                            <div className="text-sm font-black text-white font-mono tracking-tighter">{formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => toggleWishlist(card.id)}
                                                            className="p-2.5 bg-white text-slate-950 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 group/x"
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

                        {/* TAB: SUPPORT (Compact Full-Width Terminal) */}
                        {activeTab === 'support' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* Direct Transmission Form - Full Width & Compact */}
                                <div className="bg-white/[0.02] border border-white/10 rounded-[15px] p-5 sm:p-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                                    <Mail className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-1">Direct Secure Uplink</h3>
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-60">Authorized Response Encrypted to Email</p>
                                                </div>
                                            </div>
                                            <div className="px-5 py-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">System Status: Active</span>
                                            </div>
                                        </div>

                                        <form className="space-y-5" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            createTicket({
                                                userEmail: user.email,
                                                subject: formData.get('subject'),
                                                message: formData.get('message'),
                                                priority: formData.get('priority'),
                                                category: 'General Inquiry'
                                            });
                                            alert('Secure Transmission Initiated. Final reply arriving in your registered email.');
                                            e.target.reset();
                                        }}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Protocol Tier</label>
                                                    <select name="priority" className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 text-xs font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all uppercase appearance-none cursor-pointer">
                                                        <option value="low">Standard Signal</option>
                                                        <option value="high">Urgent Transmission</option>
                                                        <option value="critical">Critical Anomaly</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Reference Subject</label>
                                                    <input name="subject" required type="text" placeholder="Specify context..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 text-xs font-black text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Encrypted Log Content</label>
                                                <textarea name="message" required rows="2" placeholder="Input parameters for admin analysis..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-xs font-black text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"></textarea>
                                            </div>

                                            <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic opacity-60">
                                                    Authorizing response broadcast to: <span className="text-indigo-400 font-mono tracking-tight">{user.email}</span>
                                                </p>
                                                <button type="submit" className="w-full md:w-auto px-10 py-3.5 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/send whitespace-nowrap">
                                                    Authorize Blast
                                                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </form>
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

