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
    const [vaultSearch, setVaultSearch] = useState('');
    const [vaultFilter, setVaultFilter] = useState('all');
    
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

    const filteredVaultCards = allCards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(vaultSearch.toLowerCase()) || card.id.toLowerCase().includes(vaultSearch.toLowerCase());
        const matchesFilter = vaultFilter === 'all' || card.rarity === vaultFilter || (vaultFilter === 'owned' && ownedCards[card.id]);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-12 sm:pt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* 1. Dashboard Header (Condensed & High Impact) */}
                <div className="relative mb-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-black p-[1px] border border-white/10 overflow-hidden transition-transform group-hover:scale-105">
                                    <img src={currentAvatar.image} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <button 
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-950 rounded-xl shadow-2xl hover:scale-110 transition-all border border-white/10"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">{user.username}</h1>
                                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-md">Elite Member</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 italic">
                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-50" /> {user.email}</span>
                                    <span className="hidden sm:inline border-l border-white/10 pl-4">Rank: Super Rookie</span>
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
                                        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Package className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Vault is Empty</h3>
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">You haven't listed any digital assets in your personal vault yet.</p>
                                        <button onClick={() => window.location.href='/cards'} className="px-10 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">Discover Cards</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {allCards.filter(card => (ownedCards[card.id] || 0) > 0).map((card) => {
                                            const qty = ownedCards[card.id] || 0;
                                            return (
                                                <div 
                                                    key={card.id} 
                                                    className="group relative flex flex-col p-5 rounded-[2.5rem] border bg-white/[0.02] border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl hover:-translate-y-2"
                                                >
                                                    <div className="relative aspect-[1/1.4] rounded-[1.5rem] overflow-hidden mb-6 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                                        <img 
                                                            src={getCardImageUrl(card.image)} 
                                                            alt={card.name} 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute top-3 right-3 bg-white text-slate-950 w-10 h-10 rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white/20">
                                                            <span className="text-[10px] font-black leading-none">{qty}</span>
                                                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-50">PCS</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="px-1">
                                                        <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1.5 opacity-60">{card.id}</div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 mb-5">{card.name}</h4>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 rounded-2xl">
                                                                <button onClick={() => updateOwnedCard(card.id, qty - 1)} className="p-1 text-slate-500 hover:text-rose-500 transition-colors"><Minus className="w-4 h-4" /></button>
                                                                <span className="text-xs font-black text-white font-mono">{qty}</span>
                                                                <button onClick={() => updateOwnedCard(card.id, qty + 1)} className="p-1 text-slate-500 hover:text-emerald-500 transition-colors"><Plus className="w-4 h-4" /></button>
                                                            </div>
                                                            <button 
                                                                onClick={() => updateOwnedCard(card.id, 0)}
                                                                className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                                                title="Remove from Vault"
                                                            >
                                                                <X className="w-4 h-4" />
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
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {wishlist.length === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                                        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Heart className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Silent Watchlist</h3>
                                        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-8">Save assets from the market to track them here.</p>
                                        <button onClick={() => window.location.href='/marketplace'} className="px-10 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">Go to Marketplace</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allCards.filter(c => wishlist.includes(c.id)).map(card => (
                                            <div key={card.id} className="group relative bg-slate-900/50 border border-white/5 p-5 rounded-[2.5rem] hover:border-amber-500/20 transition-all duration-500">
                                                <div className="flex gap-5">
                                                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-black flex-shrink-0">
                                                        <img src={getCardImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <div className="flex-1 py-1">
                                                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{card.set}</div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3 line-clamp-2">{card.name}</h4>
                                                        <div className="text-xs font-bold text-white font-mono">{formatPrice(card.priceEnglish, currency, USD_TO_INR)}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => toggleWishlist(card.id)}
                                                    className="absolute top-4 right-4 p-2 bg-slate-950 rounded-lg text-rose-500 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: ACTIVITY Log (Trade History) */}
                        {activeTab === 'history' && (
                             <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="p-8 border-b border-white/5 bg-black/20 flex items-center gap-4">
                                    <History className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-base font-black text-white uppercase tracking-widest italic">Terminal Logs</h3>
                                </div>
                                {getTransactions().length === 0 ? (
                                    <div className="py-24 text-center">
                                        <History className="w-12 h-12 text-slate-800 mx-auto mb-6 opacity-30" />
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] italic">No digital records found for active session</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                                    <th className="py-6 px-10">Record Hash</th>
                                                    <th className="py-6 px-10">Operation</th>
                                                    <th className="py-6 px-10">Asset</th>
                                                    <th className="py-6 px-10 text-right">Settlement</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {getTransactions().map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                                                        <td className="py-6 px-10 text-[10px] font-mono text-slate-600 uppercase tracking-tighter italic">#{tx.id.toString().slice(-8)}</td>
                                                        <td className="py-6 px-10">
                                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>{tx.type}</span>
                                                        </td>
                                                        <td className="py-6 px-10 text-xs font-black text-white uppercase tracking-tight">{tx.card.name}</td>
                                                        <td className="py-6 px-10 text-right font-black font-mono text-white tracking-widest text-sm">{formatPrice(tx.total, currency, USD_TO_INR)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                             </div>
                        )}

                        {/* TAB: SUPPORT */}
                        {activeTab === 'support' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-amber-600 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="text-center md:text-left">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Priority Assistance</h2>
                                            <p className="text-white/80 text-xs font-semibold max-w-sm leading-relaxed tracking-wide">Elite collection agents are standing by for asset valuation, contract disputes, and account security.</p>
                                        </div>
                                        <button onClick={() => setShowSupportModal(true)} className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Encrypted Support</button>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
                                    {userTickets.length === 0 ? (
                                        <div className="p-20 text-center text-slate-600 text-[10px] font-black uppercase italic tracking-widest">No active secure channels</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {userTickets.map((ticket) => (
                                                <div key={ticket.id} className="p-8 hover:bg-white/[0.02] transition-colors group">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ticket.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{ticket.priority}</span>
                                                                <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">{ticket.category}</span>
                                                            </div>
                                                            <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{ticket.subject}</h4>
                                                        </div>
                                                        <div className={`px-5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] text-center ${
                                                            ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        }`}>
                                                            Status: {ticket.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

