import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
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
        user, loading, updateName, updateAvatar, getTransactions, 
        wishlist, toggleWishlist, 
        ownedCards, updateOwnedCard 
    } = useUser();
    const navigate = useNavigate();

    // Redirect unauthenticated users to home
    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);
    
    const [allCards, setAllCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [activeTab, setActiveTab] = useState('vault');
    const [currency, setCurrency] = useState('INR');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user?.name || user?.username || '');
    
    const [vaultPage, setVaultPage] = useState(1);
    const [wishlistPage, setWishlistPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const Pagination = ({ currentPage, totalItems, onPageChange }) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
            if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
            if (currentPage > totalPages - 4) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        };

        return (
            <div className="flex justify-center items-center gap-2 mt-12 pb-4">
                <button 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((page, i) => (
                        page === '...' ? (
                            <span key={`dots-${i}`} className="text-slate-700 text-[10px] px-1">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${
                                    currentPage === page 
                                        ? 'bg-white text-slate-950 shadow-lg scale-105 select-none' 
                                        : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 cursor-pointer'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>
                <button 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        );
    };

    const { 
        getUserTickets, createTicket, addUserResponse, refreshTickets,
        markAsRead, deleteTicket, tickets: allTickets 
    } = useSupport();
    const userTickets = user ? getUserTickets(user.email) : [];
    const [showSupportSuccess, setShowSupportSuccess] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingUser, setIsSendingUser] = useState(false);
    const [userErrorMessage, setUserErrorMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const messagesEndRef = React.useRef(null);
    const chatViewportRef = React.useRef(null);

    const scrollToBottom = () => {
        if (chatViewportRef.current) {
            chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
        }
    };

    // Auto-scroll when messages change or ticket is selected
    useEffect(() => {
        if (selectedTicketId) {
            setTimeout(scrollToBottom, 100);
            
            // Mark as read if it has a reply
            const ticket = userTickets.find(t => t.id === selectedTicketId);
            if (ticket && ticket.status === 'replied') {
                markAsRead(selectedTicketId);
            }
        }
    }, [selectedTicketId, allTickets, userTickets]);

    // Optimized Defered Fetch: Only pull all cards if user enters the Vault/Wishlist
    useEffect(() => {
        if (loadingCards && (activeTab === 'vault' || activeTab === 'wishlist')) {
            const fetchCards = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cards`);
                    const data = await response.json();
                    setAllCards(data);
                } catch (err) {
                    // console.error("Error fetching cards for vault:", err);
                } finally {
                    setLoadingCards(false);
                }
            };
            fetchCards();
        } else if (activeTab === 'history') {
             // If we land on history, we don't need cards immediately
             setLoadingCards(false); 
        }
    }, [activeTab, loadingCards]);

    // Force aggressive sync when Support Hub is opened
    useEffect(() => {
        if (activeTab === 'history') {
             refreshTickets();
        }
    }, [activeTab]);

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
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-amber-500/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-32 relative z-10">
                
                {/* 1. Dashboard Header: Premium Profile Hub */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full lg:w-auto">
                        <div className="relative group flex-shrink-0">
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/10 overflow-hidden shadow-2xl bg-slate-900 ring-4 ring-white/5 transition-transform duration-500 group-hover:scale-105">
                                <img src={currentAvatar.image} alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <button 
                                onClick={() => setShowAvatarSelector(true)}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg border-2 border-[#020617] hover:scale-110 active:scale-90 transition-all z-20"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="space-y-1 sm:space-y-2 mb-4">
                                
                                {isEditingName ? (
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <input 
                                            autoFocus
                                            className="bg-white/5 border border-amber-500/30 rounded-xl px-4 py-2 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full max-w-sm"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && updateName(tempName) && setIsEditingName(false)}
                                        />
                                        <button onClick={() => { updateName(tempName); setIsEditingName(false); }} className="p-2 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors"><CheckCircle2 className="w-5 h-5" /></button>
                                        <button onClick={() => setIsEditingName(false)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    <h1 
                                        onClick={() => setIsEditingName(true)}
                                        className="text-2xl sm:text-3xl font-black text-white tracking-tighter flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer group/name"
                                    >
                                        {user.name || user.username}
                                        <Settings className="w-3.5 h-3.5 opacity-0 group-hover/name:opacity-30 transition-opacity" />
                                    </h1>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 relative z-10">
                                <div className="px-3 py-1.5 bg-white/5 backdrop-blur-xl border border-white/5 rounded-lg flex items-center gap-2.5">
                                    <Shield className="w-3 h-3 text-slate-500" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-tight">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Vault Stats Bento Card */}
                    <div className="flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                        <div className="flex-1 lg:min-w-[200px] p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12" />
                            <div className="relative z-10">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2 block leading-none">Net Worth</span>
                                <div className="flex items-baseline gap-2.5">
                                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter font-mono leading-none">
                                        {formatPrice(portfolioStats.totalWorth, currency, USD_TO_INR)}
                                    </h2>
                                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-black border leading-none ${
                                        portfolioStats.percentChange >= 0 
                                            ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                                            : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                                    }`}>
                                        {portfolioStats.percentChange >= 0 ? '+' : ''}{portfolioStats.percentChange.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            {['USD', 'INR'].map(cur => (
                                <button 
                                    key={cur}
                                    onClick={() => setCurrency(cur)} 
                                    className={`w-10 h-7 rounded-lg text-[8px] font-black transition-all border ${
                                        currency === cur 
                                            ? 'bg-white text-slate-950 shadow-lg scale-105' 
                                            : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {cur}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Command Hub - Optimized for ALL Screens (Mobile Top Tabs) */}
                <div className="flex justify-center mb-10 sticky top-[72px] sm:top-24 z-[40] pointer-events-none">
                    <div className="p-1 sm:p-1.5 bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center gap-0.5 sm:gap-1 shadow-2xl pointer-events-auto">
                        {[
                            { id: 'vault', short: 'Vault', full: 'Card Vault', icon: Package, mobile: true },
                            { id: 'wishlist', short: 'Watch', full: 'Watchlist', icon: Heart, mobile: true },
                            { id: 'history', short: 'Logs', full: 'Messages', icon: History, mobile: false },
                            { id: 'support', short: 'Trans', full: 'Support Hub', icon: HelpCircle, mobile: false },
                        ].map((item) => {
                            const active = activeTab === item.id;
                            const hasNotification = item.id === 'history' && userTickets.some(t => t.status === 'replied');
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`relative items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 ${
                                        item.mobile ? 'flex' : 'hidden sm:flex'
                                    } ${
                                        active 
                                            ? 'bg-white text-slate-950 shadow-xl' 
                                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${active ? 'fill-slate-950' : ''}`} />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none">
                                        <span className="sm:hidden">{item.short}</span>
                                        <span className="hidden sm:inline">{item.full}</span>
                                    </span>
                                    {hasNotification && (
                                        <div className="absolute top-1 right-1 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse" />
                                    )}
                                    {active && (
                                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-amber-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* Content Stage */}
                    <div className="w-full">
                        
                        {/* TAB: THE VAULT (Collection Manager - Simplified to Owned Items) */}
                        {activeTab === 'vault' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {loadingCards ? (
                                    <div className="py-24 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-4" />
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse">Decrypting Vault Data...</p>
                                    </div>
                                ) : portfolioStats.ownedCount === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.01] border border-white/5 rounded-3xl px-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl relative z-10">
                                            <Package className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic relative z-10">Vault Protocol Empty</h3>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-8 max-w-sm mx-auto leading-relaxed relative z-10">Your secure storage is offline. Initialize tracking.</p>
                                        <button onClick={() => navigate('/cards')} className="px-10 py-4 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-xl relative z-10">Initialize</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                                            {(() => {
                                                const vaultCards = allCards.filter(card => (ownedCards[card.id] || 0) > 0);
                                                const start = (vaultPage - 1) * ITEMS_PER_PAGE;
                                                return vaultCards.slice(start, start + ITEMS_PER_PAGE).map((card) => {
                                                    const qty = ownedCards[card.id] || 0;
                                                    const cardWorth = (card.priceEnglish || 50) * qty;
                                                    return (
                                                        <div 
                                                            key={card.id} 
                                                            className="group relative flex flex-col bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl"
                                                        >
                                                            {/* Asset ID Ribbon - Scaled Down */}
                                                            <div className="absolute top-2 left-2 z-20">
                                                                <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-xl rounded-md border border-white/10 flex items-center gap-1">
                                                                    <div className="w-0.5 h-0.5 rounded-full bg-amber-500" />
                                                                    <span className="text-[6px] font-black text-white uppercase tracking-tighter">{card.id}</span>
                                                                </div>
                                                            </div>

                                                            {/* Portfolio Control */}
                                                            <div className="absolute top-2 right-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                                                <button 
                                                                    onClick={() => updateOwnedCard(card.id, 0)}
                                                                    className="w-6 h-6 bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 text-rose-500 rounded-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Image Container */}
                                                            <div className="relative aspect-[0.75/1] overflow-hidden">
                                                                <img 
                                                                    src={getCardImageUrl(card.image)} 
                                                                    alt={card.name} 
                                                                    className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-110"
                                                                />
                                                                
                                                                {/* Unit Counter Overlay - Mobile optimized */}
                                                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between p-1 bg-black/60 backdrop-blur-2xl rounded-lg border border-white/5 shadow-xl">
                                                                    <button onClick={() => updateOwnedCard(card.id, qty - 1)} className="p-1 text-white/40"><Minus className="w-3 h-3" /></button>
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-[10px] font-black text-white leading-none">{qty}</span>
                                                                        <span className="text-[5px] font-bold text-white/40 uppercase tracking-tighter">Units</span>
                                                                    </div>
                                                                    <button onClick={() => updateOwnedCard(card.id, qty + 1)} className="p-1 text-white/40"><Plus className="w-3 h-3" /></button>
                                                                </div>

                                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
                                                            </div>
                                                            
                                                            {/* Content Info - Very Compact */}
                                                            <div className="p-2.5 sm:p-4 space-y-2">
                                                                <div className="space-y-0.5">
                                                                    <h4 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-tighter line-clamp-1 italic-gradient">{card.name}</h4>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[6px] sm:text-[8px] font-bold text-slate-600 uppercase tracking-widest">Worth</span>
                                                                        <span className="text-[10px] sm:text-sm font-black text-white font-mono tracking-tighter">{formatPrice(cardWorth, currency, USD_TO_INR)}</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                                                                    <div className="flex items-center gap-1">
                                                                        <Activity className="w-2 h-2 text-emerald-500" />
                                                                        <span className="text-[6px] sm:text-[7px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                                                                    </div>
                                                                    <span className="text-[7px] sm:text-[8px] font-black text-slate-500 font-mono italic">{formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <Pagination 
                                            currentPage={vaultPage} 
                                            totalItems={allCards.filter(card => (ownedCards[card.id] || 0) > 0).length} 
                                            onPageChange={(p) => { setVaultPage(p); window.scrollTo({ top: 300, behavior: 'smooth' }); }} 
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB: WISHLIST HUB */}
                        {activeTab === 'wishlist' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                                {loadingCards ? (
                                    <div className="py-24 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-4" />
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse">Scanning...</p>
                                    </div>
                                ) : wishlist.length === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.01] border border-white/5 rounded-3xl px-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl relative z-10">
                                            <Heart className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic relative z-10">Watchlist Inactive</h3>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-8 max-w-sm mx-auto leading-relaxed relative z-10">Awaiting target parameters.</p>
                                        <button onClick={() => navigate('/marketplace')} className="px-10 py-4 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-xl relative z-10">Catalog</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                                            {(() => {
                                                const wishlistCards = allCards.filter(c => wishlist.includes(c.id));
                                                const start = (wishlistPage - 1) * ITEMS_PER_PAGE;
                                                return wishlistCards.slice(start, start + ITEMS_PER_PAGE).map(card => (
                                                    <div 
                                                        key={card.id} 
                                                        className="group relative flex flex-col bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all duration-500 shadow-xl"
                                                    >
                                                        {/* Monitoring Status Badge - Compact */}
                                                        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xl rounded-md border border-white/10 outline outline-1 outline-white/5">
                                                            <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[6px] font-black text-white uppercase tracking-tighter leading-none">Live</span>
                                                        </div>

                                                        {/* Quick Action Overlay */}
                                                        <div className="absolute top-2 right-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleWishlist(card.id); }}
                                                                className="w-6 h-6 bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 text-rose-500 rounded-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Image Core */}
                                                        <div className="relative aspect-[0.75/1] overflow-hidden grayscale-[0.4] md:group-hover:grayscale-0 transition-all duration-700">
                                                            <img 
                                                                src={getCardImageUrl(card.image)} 
                                                                alt={card.name} 
                                                                className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                                                        </div>
                                                        
                                                        {/* Terminal Info - Highly Compact */}
                                                        <div className="p-2.5 sm:p-4 space-y-2 relative">
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className="text-[6px] font-black text-amber-500/60 uppercase tracking-widest font-mono">{card.id}</span>
                                                                    <div className="w-0.5 h-0.5 rounded-full bg-blue-500/30" />
                                                                </div>
                                                                <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-tighter line-clamp-1 italic-gradient leading-none">{card.name}</h4>
                                                            </div>

                                                            <div className="pt-2 border-t border-white/5 flex items-end justify-between gap-1.5">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest block leading-none">Price</span>
                                                                    <span className="text-[10px] sm:text-sm font-black text-white font-mono tracking-tighter leading-none">{formatPrice(card.priceEnglish || 50, currency, USD_TO_INR)}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => navigate('/marketplace')}
                                                                    className="px-2 py-1 bg-white/5 hover:bg-white text-slate-500 hover:text-slate-950 rounded-md text-[7px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white"
                                                                >
                                                                    Trade
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Background Scan Animation */}
                                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 group-hover:bg-amber-500/10 -translate-y-1 group-hover:translate-y-[200px] transition-all duration-[3000ms] pointer-events-none" />
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                        <Pagination 
                                            currentPage={wishlistPage} 
                                            totalItems={allCards.filter(c => wishlist.includes(c.id)).length} 
                                            onPageChange={(p) => { setWishlistPage(p); window.scrollTo({ top: 300, behavior: 'smooth' }); }} 
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB: EXACT VISUAL MATCH MESSAGE CENTER (FLIPPED ALIGNMENT & COMPACT) */}
                        {activeTab === 'history' && (
                            <div className="flex flex-col md:flex-row h-[500px] md:h-[550px] bg-[#0d1425]/40 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
                                
                                {/* Sidebar (List of Reports) */}
                                <div className={`w-full md:w-72 flex flex-col border-r border-white/5 bg-slate-900/20 ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
                                    <div className="p-5 border-b border-white/5">
                                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5">Message History</h3>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase">Interactive Logs</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                        {userTickets.length === 0 ? (
                                            <div className="py-12 text-center px-4 opacity-20">
                                                <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No Transmissions</p>
                                            </div>
                                        ) : (
                                            userTickets.map((ticket) => (
                                                <button
                                                    key={ticket.id}
                                                    onClick={() => setSelectedTicketId(ticket.id)}
                                                    className={`w-full p-4 rounded-xl text-left transition-all border group/item ${
                                                        selectedTicketId === ticket.id 
                                                            ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/15' 
                                                            : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`text-[10px] font-black capitalize tracking-widest ${selectedTicketId === ticket.id ? 'text-white' : 'text-slate-400'} truncate mr-2`}>
                                                            {ticket.priority}
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'replied' ? 'bg-emerald-500' : 'bg-slate-400'} shadow-lg flex-shrink-0`} />
                                                    </div>
                                                    <p className={`text-sm font-bold line-clamp-1 italic ${selectedTicketId === ticket.id ? 'text-blue-100' : 'text-slate-500 group-hover/item:text-slate-400'}`}>
                                                        "{ticket.message}"
                                                    </p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Main Chat Canvas */}
                                <div className={`flex-1 flex flex-col relative overflow-hidden bg-slate-950/20 ${selectedTicketId ? 'flex' : 'hidden md:flex'}`}>
                                    {selectedTicketId ? (
                                        (() => {
                                            const activeTicket = userTickets.find(t => String(t.id) === String(selectedTicketId));
                                            if (!activeTicket) return null;
                                            return (
                                                <>
                                                    <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01] flex-shrink-0 relative z-20">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-black border border-blue-500/20 shadow-inner">
                                                                {user.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-white capitalize tracking-tight truncate flex items-center gap-2.5">
                                                                    {activeTicket.priority || 'Transmission'}
                                                                </h4>
                                                                <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-[0.2em] italic">
                                                                    {new Date(activeTicket.updatedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => setShowDeleteConfirm(true)} 
                                                                className="w-8 h-8 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> 
                                                            </button>
                                                            <button onClick={() => setSelectedTicketId(null)} className="w-8 h-8 rounded-lg text-slate-600 hover:text-white transition-all flex items-center justify-center">
                                                                <X className="w-4 h-4" /> 
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div ref={chatViewportRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 pb-28 space-y-6">
                                                        {activeTicket.responses?.map((reply, rid) => (
                                                            <div key={reply.id || rid} className={`flex ${reply.isUser ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`flex flex-col ${reply.isUser ? 'items-end' : 'items-start'} max-w-[85%] gap-2`}>
                                                                    <div className="flex items-center gap-2 px-1">
                                                                        <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border ${
                                                                            reply.isUser ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                        }`}>
                                                                            {reply.isUser ? 'User' : 'Admin'}
                                                                        </span>
                                                                        <span className="text-[8px] font-bold text-slate-700 uppercase italic">
                                                                            {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-xl relative ${
                                                                        reply.isUser 
                                                                            ? 'bg-[#1e293b] text-slate-300 border border-white/5 rounded-tr-none' 
                                                                            : 'bg-gradient-to-br from-blue-700 to-blue-600 text-white border border-blue-400 rounded-tl-none'
                                                                    }`}>
                                                                        {reply.text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div ref={messagesEndRef} />
                                                    </div>

                                                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#0a0f1d]/95 backdrop-blur-3xl border border-white/10 rounded-2xl z-30 shadow-2xl">
                                                        <form className="relative flex items-center gap-3"
                                                            onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                if (replyText.trim() && !isSendingUser) {
                                                                    setIsSendingUser(true);
                                                                    try {
                                                                        const success = await addUserResponse(activeTicket.id, replyText, user?.name || 'User');
                                                                        if (success) { setReplyText(''); setShowSupportSuccess(true); setTimeout(() => setShowSupportSuccess(false), 2500); setTimeout(scrollToBottom, 100); }
                                                                    } catch(err) { setUserErrorMessage("Transmission Failure"); } finally { setIsSendingUser(false); }
                                                                }
                                                            }}
                                                        >
                                                            <input 
                                                                type="text" 
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Enter Followup Sequence..." 
                                                                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-800 focus:outline-none focus:border-blue-500/40 transition-all" 
                                                            />
                                                            <button 
                                                                type="submit"
                                                                disabled={!replyText.trim() || isSendingUser}
                                                                className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                                                            >
                                                                <ArrowUpRight className="w-5 h-5" />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-20">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6">
                                                <History className="w-8 h-8 text-slate-500" />
                                            </div>
                                            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Awaiting Selection</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: SUPPORT (Compact Full-Width Terminal) */}
                        {activeTab === 'support' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700 max-w-3xl mx-auto pb-20 md:pb-0">
                                <div className="bg-[#0d1425]/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32 transition-opacity opacity-0 group-hover:opacity-100" />
                                    
                                    <div className="relative z-10 space-y-6 sm:space-y-8">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase leading-none mb-1">Central Transmission</h3>
                                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase">Priority Protocol: Active</p>
                                                </div>
                                            </div>
                                        </div>

                                        <form className="space-y-5 sm:space-y-6" onSubmit={async (e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const success = await createTicket({ userEmail: user.email, message: formData.get('message'), priority: formData.get('priority'), category: 'General Inquiry' });
                                            if (success) { setShowSupportSuccess(true); e.target.reset(); setTimeout(() => { setShowSupportSuccess(false); setActiveTab('history'); }, 2000); }
                                        }}>
                                            <div className="grid grid-cols-1 gap-5 sm:gap-6">
                                                <div className="space-y-2.5">
                                                    <label className="text-[11px] sm:text-sm font-medium text-white capitalize ml-1">Subject Identification</label>
                                                    <input name="priority" required type="text" placeholder="Protocol ID..." className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 sm:py-4 text-sm font-medium text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/40 transition-all shadow-inner" />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <label className="text-[11px] sm:text-sm font-medium text-white capitalize ml-1">Sequence Metadata</label>
                                                    <textarea name="message" required rows="4" placeholder="Input parameters..." className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 sm:py-4 text-sm font-medium text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/40 transition-all resize-none shadow-inner"></textarea>
                                                </div>
                                            </div>

                                            {showSupportSuccess && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Broadcast Successful.</span>
                                                </div>
                                            )}

                                            <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 capitalize leading-none">
                                                        Relay: <span className="text-white ml-1 lowercase font-normal">{user.email}</span>
                                                    </p>
                                                </div>
                                                <button type="submit" className="w-full md:w-auto px-10 py-4 sm:px-12 sm:py-5 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 group/send whitespace-nowrap">
                                                    Transmit
                                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
            {/* DELETE CONFIRMATION MODAL (SMALL COMPACT POPUP) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="w-full max-w-[320px] bg-[#0a0f1c] border border-white/10 rounded-[2rem] p-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                        <div className="relative text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 mx-auto shadow-inner">
                                <AlertCircle className="w-6 h-6 text-rose-500" />
                            </div>

                            <h3 className="text-base font-black text-white mb-2 tracking-tight uppercase italic">Confirm Purge</h3>
                            <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-8 uppercase tracking-widest opacity-60">
                                This action is irreversible. Proceed?
                            </p>

                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={async () => {
                                        if (selectedTicketId) {
                                            const success = await deleteTicket(selectedTicketId);
                                            if (success) {
                                                setSelectedTicketId(null);
                                                setShowDeleteConfirm(false);
                                            }
                                        }
                                    }}
                                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                                >
                                    Delete Record
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-500 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* AVATAR SELECTOR MODAL - HIGH DENSITY COMPACT VERSION */}
            {showAvatarSelector && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-[360px] bg-[#0a0f1c]/90 border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] -mr-24 -mt-24" />
                        
                        <div className="relative flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-black text-white tracking-tight uppercase leading-none mb-1.5">Change Identity</h3>
                                <p className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase">Select Active Protocol</p>
                            </div>
                            <button 
                                onClick={() => setShowAvatarSelector(false)}
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {CHARACTER_AVATARS.map((avatar) => {
                                const isActive = (user.selectedAvatar || 'luffy') === avatar.id;
                                return (
                                    <button
                                        key={avatar.id}
                                        onClick={async () => {
                                            await updateAvatar(avatar.id);
                                            setShowAvatarSelector(false);
                                        }}
                                        className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-500 ${
                                            isActive 
                                                ? 'bg-amber-500 border-amber-400 shadow-xl shadow-amber-500/20' 
                                                : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full overflow-hidden border transition-transform duration-500 group-hover:scale-110 mb-2 ${
                                            isActive ? 'border-white/40' : 'border-white/10'
                                        }`}>
                                            <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest text-center truncate w-full ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {avatar.id}
                                        </span>
                                        {isActive && (
                                            <div className="absolute top-1 right-1">
                                                <div className="w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-2 h-2 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
