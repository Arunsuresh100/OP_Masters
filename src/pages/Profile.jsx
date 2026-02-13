import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Camera, Mail, Calendar, ShoppingBag, TrendingUp, TrendingDown, Shield } from 'lucide-react';

// Import character images
import luffyImg from '../assets/luffy.png';
import zoroImg from '../assets/zoro.png';
import sanjiImg from '../assets/sanji.png';
import usoppImg from '../assets/Usopp.png';
import brookImg from '../assets/brook.png';

// One Piece Character Avatars - Using uploaded images
const CHARACTER_AVATARS = [
    {
        id: 'luffy',
        name: 'Monkey D. Luffy',
        role: 'Captain',
        image: luffyImg
    },
    {
        id: 'zoro',
        name: 'Roronoa Zoro',
        role: 'Swordsman',
        image: zoroImg
    },
    {
        id: 'sanji',
        name: 'Sanji',
        role: 'Cook',
        image: sanjiImg
    },
    {
        id: 'usopp',
        name: 'Usopp',
        role: 'Sniper',
        image: usoppImg
    },
    {
        id: 'brook',
        name: 'Brook',
        role: 'Musician',
        image: brookImg
    }
];

const Profile = () => {
    const { user, updateAvatar, getTransactions } = useUser();
    const [selectedAvatar, setSelectedAvatar] = useState(user?.selectedAvatar || 'luffy');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [currency, setCurrency] = useState('usd');

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-4">Please Login</h2>
                    <p className="text-slate-400">You need to be logged in to view your profile.</p>
                </div>
            </div>
        );
    }

    const handleAvatarChange = (avatarId) => {
        setSelectedAvatar(avatarId);
        const newAvatar = CHARACTER_AVATARS.find(a => a.id === avatarId);
        if (newAvatar && updateAvatar) {
            updateAvatar(newAvatar.image, avatarId);
        }
        setShowAvatarSelector(false);
    };

    const currentAvatar = CHARACTER_AVATARS.find(a => a.id === selectedAvatar) || CHARACTER_AVATARS[0];

    // Get all transactions
    const allTransactions = getTransactions ? getTransactions() : [];
    const purchases = getTransactions ? getTransactions('buy') : [];
    const sales = getTransactions ? getTransactions('sell') : [];
    const listings = allTransactions.filter(t => t.status === 'listed');

    // Calculate portfolio stats
    const portfolioStats = useMemo(() => {
        const activePurchases = purchases.filter(p => p.status === 'active');
        
        const totalInvested = activePurchases.reduce((sum, p) => sum + (p.total || 0), 0);
        
        // Simulate market value changes (in real app, would fetch from API)
        const currentValue = activePurchases.reduce((sum, p) => {
            // Random market change for demo (-20% to +50%)
            const marketChange = 0.8 + (Math.random() * 0.7);
            return sum + (p.total * marketChange);
        }, 0);
        
        const totalProfit = currentValue - totalInvested;
        const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
        
        return {
            totalInvested,
            currentValue,
            totalProfit,
            profitPercent,
            activePurchases
        };
    }, [purchases]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 p-8 mb-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/20">
                                <img 
                                    src={currentAvatar.image} 
                                    alt={user.username} 
                                    className="w-full h-full rounded-full bg-slate-800 border-4 border-slate-900"
                                />
                            </div>
                            <button 
                                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                className="absolute bottom-0 right-0 p-2.5 bg-amber-500 rounded-full shadow-lg hover:bg-amber-400 transition-all group"
                            >
                                <Camera className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight">{user.username}</h1>
                                {user.verified && (
                                    <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Verified</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-400 justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-amber-500" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span>Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950/50 border border-white/10 rounded-xl">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Character:</span>
                                    <span className="text-sm font-black text-amber-500">{currentAvatar.name}</span>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs font-bold text-slate-400">{currentAvatar.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trading Stats */}
                        <div className="grid grid-cols-3 gap-4 md:gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-black text-amber-500 mb-1">0</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Listings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-emerald-500 mb-1">0</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sold</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-blue-500 mb-1">0</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Bought</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Selector Modal */}
                {showAvatarSelector && (
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Choose Your Character</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {CHARACTER_AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => handleAvatarChange(avatar.id)}
                                    className={`group relative p-4 rounded-2xl border-2 transition-all ${
                                        selectedAvatar === avatar.id 
                                            ? 'border-amber-500 bg-amber-500/10' 
                                            : 'border-white/10 bg-slate-950/50 hover:border-amber-500/50'
                                    }`}
                                >
                                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-1">
                                        <img 
                                            src={avatar.image} 
                                            alt={avatar.name} 
                                            className="w-full h-full rounded-full bg-slate-800"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-black text-white mb-1">{avatar.name.split(' ').pop()}</div>
                                        <div className="text-[10px] font-bold text-slate-500">{avatar.role}</div>
                                    </div>
                                    {selectedAvatar === avatar.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Portfolio Summary */}
                {purchases.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <Activity className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Portfolio Summary</h2>
                                <p className="text-xs text-slate-500">Your investment performance</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Invested</div>
                                <div className="text-2xl font-black text-white font-mono">{formatPrice(portfolioStats.totalInvested, currency, USD_TO_INR)}</div>
                            </div>
                            
                            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Current Value</div>
                                <div className="text-2xl font-black text-white font-mono">{formatPrice(portfolioStats.currentValue, currency, USD_TO_INR)}</div>
                            </div>
                            
                            <div className={`border rounded-xl p-4 ${
                                portfolioStats.totalProfit >= 0 
                                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                                    : 'bg-red-500/10 border-red-500/30'
                            }`}>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Profit/Loss</div>
                                <div className="flex items-center gap-2">
                                    <div className={`text-2xl font-black font-mono ${
                                        portfolioStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {portfolioStats.totalProfit >= 0 ? '+' : ''}{formatPrice(portfolioStats.totalProfit, currency, USD_TO_INR)}
                                    </div>
                                    {portfolioStats.totalProfit >= 0 ? (
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div className={`text-sm font-bold mt-1 ${
                                    portfolioStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                    {portfolioStats.profitPercent >= 0 ? '+' : ''}{portfolioStats.profitPercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trading Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Selling History */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <ShoppingBag className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Selling History</h2>
                                <p className="text-xs text-slate-500">Cards you've sold or are selling</p>
                            </div>
                        </div>
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-950/50 border border-white/5 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">No selling history</p>
                            <p className="text-xs text-slate-700 mt-1">List cards on the marketplace to start selling</p>
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Purchase History</h2>
                                <p className="text-xs text-slate-500">Cards you've bought</p>
                            </div>
                        </div>
                        
                        {purchases.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-950/50 border border-white/5 flex items-center justify-center">
                                    <TrendingUp className="w-8 h-8 text-slate-700" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">No purchases yet</p>
                                <p className="text-xs text-slate-700 mt-1">Browse the marketplace to start collecting</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {purchases.map((purchase) => {
                                    // Simulate market change
                                    const marketChange = 0.8 + (Math.random() * 0.7);
                                    const currentValue = purchase.total * marketChange;
                                    const profit = currentValue - purchase.total;
                                    const profitPercent = ((profit / purchase.total) * 100);
                                    
                                    return (
                                        <div key={purchase.id} className={`border rounded-xl p-4 transition-all ${
                                            profit >= 0 
                                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                                                : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        }`}>
                                            <div className="flex gap-3">
                                                <img 
                                                    src={purchase.card.image} 
                                                    alt={purchase.card.name} 
                                                    className="w-12 h-16 rounded bg-slate-800 object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-white text-sm mb-1 truncate">{purchase.card.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono">{purchase.card.id}</div>
                                                    
                                                    <div className="mt-2 space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-500">Purchase:</span>
                                                            <span className="text-slate-300 font-mono">{formatPrice(purchase.total, currency, USD_TO_INR)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-500">Current:</span>
                                                            <span className="text-white font-mono font-bold">{formatPrice(currentValue, currency, USD_TO_INR)}</span>
                                                        </div>
                                                        <div className={`flex justify-between items-center text-xs font-bold ${
                                                            profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                            <span>Profit/Loss:</span>
                                                            <span className="flex items-center gap-1">
                                                                {profit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                                {profit >= 0 ? '+' : ''}{formatPrice(profit, currency, USD_TO_INR)} 
                                                                ({profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                            purchase.status === 'active' 
                                                                ? 'bg-emerald-500/20 text-emerald-400' 
                                                                : 'bg-slate-700 text-slate-400'
                                                        }`}>
                                                            {purchase.status}
                                                        </span>
                                                        <span className="text-[9px] text-slate-600">
                                                            {new Date(purchase.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
