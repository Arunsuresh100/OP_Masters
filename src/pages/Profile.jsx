import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useSupport } from '../context/SupportContext';
import SupportTicketModal from '../components/SupportTicketModal';
import { Camera, Mail, Calendar, ShoppingBag, TrendingUp, TrendingDown, Shield, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Wallet, History, Tag, ChevronRight, LayoutDashboard, Settings, HelpCircle, Package, ExternalLink, Info } from 'lucide-react';
import { formatPrice } from '../utils';
import { USD_TO_INR } from '../constants';

// Helper for deterministic pseudo-random values (0.8 to 1.5)
const getDeterministicChange = (cardId, userEmail) => {
    const seed = `${cardId}-${userEmail}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    // Convert hash to 0.8 - 1.5 range
    const absHash = Math.abs(hash);
    return 0.8 + ((absHash % 70) / 100);
};

// Import character images
import luffyImg from '../assets/luffy.png';
import zoroImg from '../assets/zoro.png';
import sanjiImg from '../assets/sanji.png';
import usoppImg from '../assets/Usopp.png';
import brookImg from '../assets/brook.png';

// One Piece Character Avatars - Using uploaded images
const CHARACTER_AVATARS = [
    { id: 'luffy', name: 'Monkey D. Luffy', role: 'Captain', image: luffyImg },
    { id: 'zoro', name: 'Roronoa Zoro', role: 'Swordsman', image: zoroImg },
    { id: 'sanji', name: 'Sanji', role: 'Cook', image: sanjiImg },
    { id: 'usopp', name: 'Usopp', role: 'Sniper', image: usoppImg },
    { id: 'brook', name: 'Brook', role: 'Musician', image: brookImg }
];

const Profile = () => {
    const { user, updateAvatar, getTransactions } = useUser();
    const [selectedAvatar, setSelectedAvatar] = useState(user?.selectedAvatar || 'luffy');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const [activeTab, setActiveTab] = useState('portfolio');
    const { getUserTickets } = useSupport();
    const userTickets = user ? getUserTickets(user.email) : [];

    // Sync selectedAvatar when user changes
    useEffect(() => {
        if (user?.selectedAvatar) {
            setSelectedAvatar(user.selectedAvatar);
        }
    }, [user]);

    // Get all transactions
    const allTransactions = user && getTransactions ? getTransactions() : [];
    const purchases = user && getTransactions ? getTransactions('buy') : [];
    const sales = user && getTransactions ? getTransactions('sell') : [];
    const listings = allTransactions.filter(t => t.status === 'listed');

    // Calculate portfolio stats
    const portfolioStats = useMemo(() => {
        if (!user || purchases.length === 0) {
            return { totalInvested: 0, currentValue: 0, totalProfit: 0, profitPercent: 0, activePurchases: [] };
        }
        const activePurchases = purchases.filter(p => p.status === 'active');
        const totalInvested = activePurchases.reduce((sum, p) => sum + (p.total || 0), 0);
        const currentValue = activePurchases.reduce((sum, p) => {
            const marketChange = getDeterministicChange(p.card.id, user.email);
            return sum + (p.total * marketChange);
        }, 0);
        const totalProfit = currentValue - totalInvested;
        const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
        return { totalInvested, currentValue, totalProfit, profitPercent, activePurchases };
    }, [user, purchases]);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                    <Shield className="w-10 h-10 text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Secure Area</h2>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-bold leading-relaxed">Verification required. Please provide your credentials to access the Trading Dashboard.</p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Return Home</button>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Sign In</button>
                </div>
            </div>
        );
    }

    const handleAvatarChange = (avatarId) => {
        setSelectedAvatar(avatarId);
        if (updateAvatar) updateAvatar(avatarId);
        setShowAvatarSelector(false);
    };

    const currentAvatar = CHARACTER_AVATARS.find(a => a.id === selectedAvatar) || CHARACTER_AVATARS[0];

    return (
        <div className="min-h-screen bg-slate-950 pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* 1. Dashboard Hero Header */}
                <div className="relative mb-8 p-6 sm:p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                    {/* Abstract Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                    
                    <div className="relative flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">
                        {/* Profile Identity */}
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 shadow-[0_20px_50px_rgba(245,158,11,0.3)]">
                                    <img 
                                        src={currentAvatar.image} 
                                        alt={user.username} 
                                        className="w-full h-full rounded-full bg-slate-950 object-cover border-4 border-slate-900"
                                    />
                                </div>
                                <button 
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    className="absolute bottom-1 right-1 p-3 bg-white text-slate-950 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-10"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{user.username}</h1>
                                    <div className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                        <Shield className="w-3.5 h-3.5" /> Verified Trader
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-amber-500" /> {user.email}</div>
                                    <div className="flex items-center gap-2.5"><Activity className="w-4 h-4 text-purple-500" /> Level 12 Collector</div>
                                    <div className="flex items-center gap-2.5 text-slate-400 border-l border-white/10 pl-6 hidden md:flex italic">Crew: {currentAvatar.name}</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Portfolio Stats Card */}
                        <div className="w-full lg:w-auto min-w-[280px] bg-white text-slate-950 p-8 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                           <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">Estimated Worth</span>
                                 <div className="flex bg-slate-950/5 rounded-lg p-0.5">
                                    <button onClick={() => setCurrency('USD')} className={`px-2 py-0.5 rounded-md text-[8px] font-black transition-all ${currency === 'USD' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>USD</button>
                                    <button onClick={() => setCurrency('INR')} className={`px-2 py-0.5 rounded-md text-[8px] font-black transition-all ${currency === 'INR' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>INR</button>
                                 </div>
                              </div>
                              <div className="text-4xl font-black tracking-tighter mb-1 tabular-nums">
                                 {formatPrice(portfolioStats.currentValue, currency, USD_TO_INR)}
                              </div>
                              <div className={`flex items-center gap-2 text-[11px] font-black uppercase ${portfolioStats.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {portfolioStats.totalProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                 {portfolioStats.profitPercent !== 0 ? `${portfolioStats.profitPercent.toFixed(2)}%` : 'Active Performance'}
                              </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Selector Drawer */}
                {showAvatarSelector && (
                    <div className="mb-8 p-8 bg-slate-900 border border-white/5 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                             <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Identity Configuration</h3>
                             <button onClick={() => setShowAvatarSelector(false)} className="text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-widest transition-colors">Dismiss</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {CHARACTER_AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => handleAvatarChange(avatar.id)}
                                    className={`group relative p-6 rounded-2xl border transition-all ${selectedAvatar === avatar.id ? 'bg-white border-white scale-105 shadow-2xl' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-slate-950 shadow-inner group-hover:scale-105 transition-transform">
                                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-xs font-black uppercase tracking-tight mb-0.5 ${selectedAvatar === avatar.id ? 'text-slate-950' : 'text-white'}`}>{avatar.name.split(' ').pop()}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-widest ${selectedAvatar === avatar.id ? 'text-slate-500' : 'text-slate-500'}`}>{avatar.role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT: Sidebar Navigation (Desktop) */}
                    <div className="lg:col-span-3 space-y-3">
                        {[
                            { id: 'portfolio', label: 'Portfolio Hub', icon: LayoutDashboard, color: 'text-amber-500' },
                            { id: 'history', label: 'Trade History', icon: History, color: 'text-emerald-500' },
                            { id: 'listings', label: 'My Listings', icon: Tag, color: 'text-purple-500' },
                            { id: 'support', label: 'Support & Help', icon: HelpCircle, color: 'text-blue-500' },
                            { id: 'settings', label: 'Preferences', icon: Settings, color: 'text-slate-500' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98] ${activeTab === item.id ? 'bg-white border-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-slate-950' : item.color}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === item.id ? 'text-slate-950' : ''}`}>{item.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 opacity-30 ${activeTab === item.id ? 'text-slate-950' : ''}`} />
                            </button>
                        ))}
                    </div>

                    {/* RIGHT: Content Area */}
                    <div className="lg:col-span-9">
                        
                        {/* TAB: Portfolio Hub */}
                        {activeTab === 'portfolio' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* Insights Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Capital Invested</div>
                                        <div className="text-2xl font-black text-white tabular-nums mb-1">{formatPrice(portfolioStats.totalInvested, currency, USD_TO_INR)}</div>
                                        <div className="text-[10px] font-bold text-slate-600">Total Buy Volume</div>
                                    </div>
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Positions</div>
                                        <div className="text-2xl font-black text-white tabular-nums mb-1">{portfolioStats.activePurchases.length}</div>
                                        <div className="text-[10px] font-bold text-slate-600">Unique Assets Owned</div>
                                    </div>
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">P/L Performance</div>
                                        <div className={`text-2xl font-black tabular-nums mb-1 ${portfolioStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {portfolioStats.totalProfit >= 0 ? '+' : ''}{formatPrice(portfolioStats.totalProfit, currency, USD_TO_INR)}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-600 tracking-wider">Unrealized Momentum</div>
                                    </div>
                                </div>

                                {/* Active Assets Feed */}
                                <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5 text-amber-500" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Inventory Holdings</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{portfolioStats.activePurchases.length} Assets</span>
                                    </div>
                                    
                                    {portfolioStats.activePurchases.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                                <ShoppingBag className="w-8 h-8 text-slate-800" />
                                            </div>
                                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Zero Inventory Detected</p>
                                            <button onClick={() => window.location.href='/marketplace'} className="px-6 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">Browse Market</button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {portfolioStats.activePurchases.map((purchase) => {
                                                const marketChange = getDeterministicChange(purchase.card.id, user.email);
                                                const currentVal = purchase.total * marketChange;
                                                const profit = currentVal - purchase.total;
                                                const percent = ((profit / purchase.total) * 100);
                                                
                                                return (
                                                    <div key={purchase.id} className="p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-white/[0.02] transition-all">
                                                        <div className="relative flex-shrink-0">
                                                            <div className="absolute inset-0 bg-white/10 blur-[20px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
                                                            <img src={purchase.card.image} alt={purchase.card.name} className="w-16 h-22 rounded-xl bg-black border border-white/10 shadow-2xl relative z-10 transition-transform group-hover:scale-105 group-hover:-rotate-2" />
                                                        </div>
                                                        <div className="flex-1 text-center md:text-left">
                                                            <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">{purchase.card.id}</div>
                                                            <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">{purchase.card.name}</h4>
                                                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Acquired {new Date(purchase.timestamp).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Entry: {formatPrice(purchase.total, currency, USD_TO_INR)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-center md:items-end gap-1.5">
                                                            <div className="text-xl font-black text-white tabular-nums tracking-tighter">{formatPrice(currentVal, currency, USD_TO_INR)}</div>
                                                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 ${profit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                {profit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                                {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="pl-4 hidden md:block">
                                                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><ExternalLink className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: Trade History */}
                        {activeTab === 'history' && (
                             <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                    <History className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Full Transaction Log</h3>
                                </div>
                                {allTransactions.length === 0 ? (
                                    <div className="p-20 text-center text-slate-600 font-bold uppercase text-[9px] tracking-widest italic">No trades executed in current session</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-black/20 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                                    <th className="py-5 px-8">Transaction ID</th>
                                                    <th className="py-5 px-8">Type</th>
                                                    <th className="py-5 px-8">Asset</th>
                                                    <th className="py-5 px-8 text-right">Value</th>
                                                    <th className="py-5 px-8 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {allTransactions.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-5 px-8 text-[10px] font-mono text-slate-500 uppercase">#{tx.id.slice(-6)}</td>
                                                        <td className="py-5 px-8">
                                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>{tx.type}</span>
                                                        </td>
                                                        <td className="py-5 px-8 text-xs font-bold text-white uppercase tracking-tight">{tx.card.name}</td>
                                                        <td className="py-5 px-8 text-right font-black font-mono text-white tracking-tighter text-sm">{formatPrice(tx.total, currency, USD_TO_INR)}</td>
                                                        <td className="py-5 px-8 text-right">
                                                            <div className="flex items-center justify-end gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Completed
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                             </div>
                        )}

                        {/* TAB: Support */}
                        {activeTab === 'support' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="text-center md:text-left">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Concierge Support</h2>
                                            <p className="text-blue-100 text-sm font-medium max-w-sm leading-relaxed opacity-80">Our specialized trading support team is available 24/7 to assist with your asset management and contract inquiries.</p>
                                        </div>
                                        <button onClick={() => setShowSupportModal(true)} className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Open Support Ticket</button>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="w-4 h-4 text-slate-400" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Inquiries</h3>
                                        </div>
                                    </div>
                                    
                                    {userTickets.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                                <Info className="w-6 h-6 text-slate-800" />
                                            </div>
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No active support interactions</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {userTickets.map((ticket) => (
                                                <div key={ticket.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ticket.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{ticket.priority}</span>
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{ticket.category}</span>
                                                            </div>
                                                            <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{ticket.subject}</h4>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                                                        </div>
                                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 flex-shrink-0">
                                                            <div className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                                                                ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            }`}>
                                                                {ticket.status}
                                                            </div>
                                                            <span className="text-[9px] text-slate-600 font-mono italic">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Other Placeholder Tabs */}
                        {(activeTab === 'listings' || activeTab === 'settings') && (
                            <div className="p-20 bg-slate-900 border border-white/5 rounded-3xl text-center animate-in fade-in duration-500">
                                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 animate-pulse">
                                    <Settings className="w-8 h-8 text-slate-800" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3 italic">Encrypted Module</h3>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-xs mx-auto">This interface is currently under construction for security auditing. Access will be granted in the next release cycle.</p>
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
