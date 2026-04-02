import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useSupport } from '../context/SupportContext';
import SupportTicketModal from '../components/SupportTicketModal';
import { 
  Camera, Mail, Calendar, ShoppingBag, TrendingUp, TrendingDown, 
  Shield, DollarSign, Activity, ArrowUpRight, ArrowDownRight, 
  Wallet, History, Tag, ChevronRight, LayoutDashboard, Settings, 
  HelpCircle, Package, ExternalLink, Info, Heart, Search, Filter, 
  User, CheckCircle2, AlertCircle, Plus, Minus, X, Trash2
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
    
    const { getUserTickets, createTicket, addUserResponse, deleteTicket } = useSupport();
    const userTickets = user ? getUserTickets(user.email) : [];
    const [showSupportSuccess, setShowSupportSuccess] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Removed auto-select useEffect as per user suggestion: "when click the message then only open"

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
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 sm:pt-28" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* 1. Dashboard Header (Condensed & High Impact) */}
                <div className="relative mb-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 md:gap-8 text-center md:text-left pt-6 md:pt-0">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950 p-[2px] border border-white/10 overflow-hidden transition-transform group-hover:scale-105 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img src={currentAvatar.image} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    className="absolute bottom-1 right-1 w-8 h-8 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-950 hover:scale-110 active:scale-90 transition-all pointer-events-auto z-20"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <div className="flex flex-col gap-1 mb-2">
                                    {isEditingName ? (
                                        <input 
                                            type="text" 
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => { setIsEditingName(false); if(tempName.trim()) updateName(tempName); }}
                                            onKeyDown={(e) => { if(e.key === 'Enter') { setIsEditingName(false); if(tempName.trim()) updateName(tempName); }}}
                                            autoFocus
                                            className="bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-2xl font-black text-white capitalize tracking-tight focus:outline-none focus:border-amber-500/50 w-full max-w-xs text-center md:text-left"
                                        />
                                    ) : (
                                        <h1 
                                            onClick={() => setIsEditingName(true)}
                                            className="text-2xl sm:text-4xl font-black text-white capitalize tracking-tight flex items-center gap-3 group/name cursor-pointer"
                                        >
                                            {user.name || user.username}
                                            <Settings className="w-4 h-4 opacity-0 group-hover/name:opacity-50 transition-opacity" />
                                        </h1>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                        <Mail className="w-3 h-3 text-slate-500" />
                                        <span className="text-[12px] font-bold text-slate-400 lowercase tracking-tight">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-none p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md" style={{ fontFamily: 'Arial, sans-serif' }}>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 capitalize tracking-tight mb-1.5">Estimated Vault Value</div>
                                <div className="flex items-end justify-center md:justify-start gap-3">
                                    <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none tracking-tighter">
                                        {formatPrice(portfolioStats.totalWorth, currency, USD_TO_INR)}
                                    </span>
                                    <span className={`text-[10px] font-black pb-1 ${portfolioStats.percentChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {portfolioStats.percentChange >= 0 ? '+' : ''}{portfolioStats.percentChange.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setCurrency('USD')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${currency === 'USD' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-500 border border-white/5'}`}>USD</button>
                                <button onClick={() => setCurrency('INR')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${currency === 'INR' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-500 border border-white/5'}`}>INR</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Professional Avatar Selector */}
                {showAvatarSelector && (
                    <div className="mb-10 p-6 bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                             <div className="flex items-center gap-3">
                                 <div className="w-1 h-4 bg-amber-500 rounded-full" />
                                 <h3 className="text-sm font-bold text-white tracking-tight uppercase">Update Identity</h3>
                             </div>
                             <button onClick={() => setShowAvatarSelector(false)} className="p-1 text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 relative z-10">
                            {CHARACTER_AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => { updateAvatar(avatar.id); setShowAvatarSelector(false); }}
                                    className={`group relative w-16 h-16 rounded-2xl transition-all duration-300 ${user.selectedAvatar === avatar.id ? 'ring-2 ring-amber-500 ring-offset-4 ring-offset-slate-950' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                    title={avatar.name}
                                >
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner">
                                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                                    </div>
                                    {user.selectedAvatar === avatar.id && (
                                        <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow-lg"><CheckCircle2 className="w-3 h-3" /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Command Dashboard Layout */}
                <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                    
                    {/* Navigation Rail - App-Style horizontal on mobile */}
                    <div className="md:col-span-3 md:sticky md:top-32 h-fit mb-8 md:mb-0">
                        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 scroll-smooth snap-x px-1">
                            {[
                                { id: 'vault', label: 'My Vault', icon: Package },
                                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                                { id: 'history', label: 'View Messages', icon: History },
                                { id: 'support', label: 'Support', icon: HelpCircle },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex-none md:w-full flex items-center gap-3 md:gap-4 p-3.5 px-6 md:p-4.5 md:px-6 rounded-xl md:rounded-2xl border transition-all snap-start ${
                                        activeTab === item.id 
                                            ? 'bg-white border-white text-slate-950 shadow-xl' 
                                            : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                    <span className="text-xs md:text-[15px] font-extrabold capitalize tracking-tight whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif' }}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Stage */}
                    <div className="md:col-span-9">
                        
                        {/* TAB: THE VAULT (Collection Manager - Simplified to Owned Items) */}
                        {activeTab === 'vault' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {portfolioStats.ownedCount === 0 ? (
                                    <div className="py-20 md:py-24 text-center bg-white/[0.02] border border-white/5 rounded-3xl md:rounded-[3rem] px-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Package className="w-6 h-6 md:w-8 md:h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Vault is Empty</h3>
                                        <p className="text-slate-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-8 max-w-[200px] mx-auto md:max-w-none">You haven't listed any digital assets in your personal vault yet.</p>
                                        <button onClick={() => window.location.href='/cards'} className="px-8 md:px-10 py-3.5 md:py-4 bg-white text-slate-950 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">Discover Cards</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 lg:gap-10">
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
                                    <div className="py-20 md:py-24 text-center bg-white/[0.02] border border-white/5 rounded-3xl md:rounded-[3rem] px-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Heart className="w-6 h-6 md:w-8 md:h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Watchlist Static</h3>
                                        <p className="text-slate-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-8 max-w-[200px] mx-auto md:max-w-none">Save upcoming assets to monitor their daily valuation metrics.</p>
                                        <button onClick={() => window.location.href='/marketplace'} className="px-8 md:px-10 py-3.5 md:py-4 bg-white text-slate-950 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all">Open Marketplace</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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

                         {/* TAB: EXACT VISUAL MATCH MESSAGE CENTER (FLIPPED ALIGNMENT & COMPACT) */}
                         {activeTab === 'history' && (
                              <div className="flex flex-col md:flex-row h-[600px] md:h-[650px] bg-[#0a0f1c] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 shadow-2xl" style={{ fontFamily: 'Arial, sans-serif' }}>
                                 
                                 {/* Sidebar (List of Reports) - Hidden on smaller screens if a ticket is selected */}
                                 <div className={`w-full md:w-80 flex flex-col border-r border-white/5 bg-[#0a0f1c] ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
                                     <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                                         {userTickets.length === 0 ? (
                                             <div className="py-20 text-center px-4">
                                                 <History className="w-10 h-10 text-slate-800 mx-auto mb-4 opacity-20" />
                                                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Records Found</p>
                                             </div>
                                         ) : (
                                             userTickets.map((ticket) => (
                                                 <button
                                                     key={ticket.id}
                                                     onClick={() => setSelectedTicketId(ticket.id)}
                                                     className={`w-full p-5 rounded-xl text-left transition-all border ${
                                                         selectedTicketId === ticket.id 
                                                             ? 'bg-[#131b2d] border-[#3b82f6]/50' 
                                                             : 'bg-[#131b2d]/40 border-white/5 hover:bg-[#131b2d]/60'
                                                     }`}
                                                 >
                                                     <div className="flex justify-between items-start mb-3">
                                                         <span className={`text-[13px] font-bold ${selectedTicketId === ticket.id ? 'text-white' : 'text-slate-300'}`}>User Report #{ticket.id.toString().slice(-4)}</span>
                                                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">2H AGO</span>
                                                     </div>
                                                     <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed opacity-80">
                                                         "{ticket.message}"
                                                     </p>
                                                 </button>
                                             ))
                                         )}
                                     </div>
                                 </div>

                                 {/* Main Conversation Pane - Full width on mobile/tablet if selected */}
                                 <div className={`flex-1 flex flex-col bg-[#0b1222] ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
                                     {selectedTicketId ? (
                                         (() => {
                                             const activeTicket = userTickets.find(t => t.id === selectedTicketId);
                                             if (!activeTicket) return null;
                                             return (
                                                 <>
                                                     {/* Pane Header */}
                                                     <div className="p-4 md:p-8 border-b border-white/5 flex items-center justify-between">
                                                         <div className="flex items-center gap-3 md:gap-5">
                                                             <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg border border-white/10 shrink-0">
                                                                 {user.name?.charAt(0).toUpperCase()}
                                                             </div>
                                                             <div className="min-w-0">
                                                                 <h3 className="text-sm md:text-lg font-bold text-white tracking-tight truncate">
                                                                     {user.name} <span className="hidden md:inline text-slate-400 font-medium normal-case text-sm">(User ID: {user.username})</span>
                                                                 </h3>
                                                                 <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-0.5 truncate">
                                                                     {new Date(activeTicket.createdAt).toLocaleDateString()} @ {new Date(activeTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                         <div className="flex items-center gap-2">
                                                             <button 
                                                                onClick={() => setShowDeleteConfirm(true)} 
                                                                className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                             >
                                                                 <Trash2 className="w-5 h-5" /> 
                                                             </button>
                                                             <button onClick={() => setSelectedTicketId(null)} className="p-2 text-slate-600 hover:text-white transition-colors">
                                                                 <X className="w-5 h-5" /> 
                                                             </button>
                                                         </div>
                                                     </div>

                                                     {/* Chat Messages Feed (Reduced Gaps) */}
                                                     <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-10 space-y-4">
                                                         
                                                         {/* Initial Inquiry (Right aligned for User) */}
                                                         <div className="flex justify-end">
                                                             <div className="max-w-[85%] sm:max-w-[75%] bg-[#1e293b]/60 border border-white/5 rounded-2xl rounded-tr-none p-4 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed shadow-lg">
                                                                 {activeTicket.message}
                                                             </div>
                                                         </div>

                                                         {/* Response Stream */}
                                                         {activeTicket.responses.map((reply, rid) => (
                                                             <div key={rid} className={`flex ${reply.isUser ? 'justify-end' : 'justify-start'}`}>
                                                                 <div className={`max-w-[85%] sm:max-w-[75%] p-4 text-xs sm:text-sm font-medium leading-relaxed shadow-xl rounded-2xl ${
                                                                     reply.isUser 
                                                                         ? 'bg-[#1e293b]/60 border border-white/5 rounded-tr-none text-slate-200' 
                                                                         : 'bg-[#1e3a8a]/40 border border-indigo-500/30 rounded-tl-none text-indigo-50'
                                                                 }`}>
                                                                     {reply.text}
                                                                 </div>
                                                             </div>
                                                         ))}

                                                         {/* Demo Placeholder (Admin Reply on left if no replays) */}
                                                         {activeTicket.responses.length === 0 && (
                                                             <div className="flex justify-start opacity-40">
                                                                 <div className="max-w-[85%] sm:max-w-[75%] p-4 text-[10px] sm:text-xs font-bold leading-relaxed shadow-xl rounded-2xl bg-[#1e3a8a]/20 border border-indigo-500/10 rounded-tl-none text-indigo-300 italic tracking-widest uppercase">
                                                                     Protocol Initialized: Awaiting Agent Link...
                                                                 </div>
                                                             </div>
                                                         )}
                                                     </div>

                                                     {/* Message Input (Full Rounded Pill) */}
                                                     <div className="p-4 sm:p-10">
                                                         <form 
                                                            className="relative max-w-4xl mx-auto"
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                if (replyText.trim()) {
                                                                    addUserResponse(activeTicket.id, replyText, user.name);
                                                                    setReplyText('');
                                                                }
                                                            }}
                                                         >
                                                             <input 
                                                                type="text" 
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Type your reply to admin..." 
                                                                className="w-full bg-[#131b2d] border border-white/10 rounded-full px-8 py-5 pr-20 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-[#3b82f6]/50 transition-all shadow-inner" 
                                                             />
                                                             <button 
                                                                type="submit"
                                                                disabled={!replyText.trim()}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                                                             >
                                                                 <ArrowUpRight className="w-5 h-5 pointer-events-none" />
                                                             </button>
                                                         </form>
                                                     </div>
                                                 </>
                                             );
                                         })()
                                     ) : (
                                         <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                                             <History className="w-12 h-12 text-slate-500 mb-6" />
                                             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Initialize Protocol</h3>
                                         </div>
                                     )}
                                 </div>

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
                                                    <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">support hub</h3>
                                                    <p className="text-[10px] font-medium text-slate-500 tracking-tight opacity-70">We'll get back to you as soon as possible</p>
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
                                            setShowSupportSuccess(true);
                                            e.target.reset();
                                            setTimeout(() => setShowSupportSuccess(false), 5000);
                                        }}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5" style={{ fontFamily: 'Arial, sans-serif' }}>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 capitalize tracking-tight ml-1">Issue</label>
                                                    <input name="priority" required type="text" placeholder="Type of issue..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 sm:px-5 py-3 text-sm font-bold text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 capitalize tracking-tight ml-1">Subject</label>
                                                    <input name="subject" required type="text" placeholder="Specify context..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 sm:px-5 py-3 text-sm font-bold text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
                                                <label className="text-xs font-bold text-slate-500 capitalize tracking-tight ml-1">Message</label>
                                                <textarea name="message" required rows="3" placeholder="Input parameters for admin analysis..." className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 sm:px-5 py-4 text-sm font-bold text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"></textarea>
                                            </div>

                                            {showSupportSuccess && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-400 capitalize">Secure transmission initiated. Protocol recorded.</span>
                                                </div>
                                            )}

                                            <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <p className="text-[8px] font-black text-slate-600 capitalize tracking-widest italic opacity-60">
                                                    Authorizing response broadcast to: <span className="text-indigo-400 font-mono tracking-tight">{user.email}</span>
                                                </p>
                                                <button type="submit" className="w-full md:w-auto px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold capitalize text-[13px] tracking-tight shadow-2xl hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/send whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif' }}>
                                                    Send
                                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
            {/* DELETE CONFIRMATION MODAL (PROFESSIONAL POPUP) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div 
                        className="w-full max-w-[90%] sm:max-w-md bg-[#0a0f1c] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                        {/* Decorative Background Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="relative">
                            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 shadow-inner">
                                <AlertCircle className="w-8 h-8 text-rose-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight uppercase italic">Delete Report?</h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 opacity-80">
                                Are you sure you want to delete this report? This action cannot be undone.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        if (selectedTicketId) {
                                            deleteTicket(selectedTicketId);
                                            setSelectedTicketId(null);
                                        }
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 transition-all"
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-4 bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

