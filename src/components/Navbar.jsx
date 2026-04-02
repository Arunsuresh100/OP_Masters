import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Instagram, Youtube, User, LogOut, Wallet, ArrowRight, ShoppingBag, TrendingUp } from 'lucide-react';
import { CHANNEL_LOGO_URL } from '../constants';
import { useUser } from '../context/UserContext';
import AuthModals from './AuthModals';

// Import character images for avatar display
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

const LOGO_PATH = '/logo.png';
const APP_LOGO = LOGO_PATH;

const Navbar = ({ 
  currency, 
  setCurrency, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  searchQuery, 
  setSearchQuery,
  channelUrl 
}) => {
  const [mobileSearchActive, setMobileSearchActive] = React.useState(false);
  const { user, logout, openAuth, authModal, closeAuth } = useUser();
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
         
         <AuthModals 
            isOpen={authModal.isOpen} 
            onClose={closeAuth} 
            initialMode={authModal.mode} 
         />

         {/* STANDARD NAVBAR CONTENT */}
         <div className={`flex items-center justify-between w-full transition-all duration-300 transform ${mobileSearchActive ? 'opacity-0 translate-y-10 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'}`}>
             <Link to="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0 min-w-0">
               <div className="relative flex-shrink-0">
                 <img src={APP_LOGO} alt="Logo" className="relative w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-black border border-white/10" 
                      onError={(e) => e.target.src = CHANNEL_LOGO_URL} />
               </div>
               <div className="flex flex-col flex-shrink-0 min-w-0">
                 <span className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent truncate uppercase">OP MASTER</span>
                 <span className="hidden md:block text-[9px] font-bold text-slate-500 uppercase tracking-widest -mt-1">TCG Trading Platform</span>
               </div>
             </Link>
          
          <div className="flex-1 min-[1100px]:hidden"></div>

           <div className="hidden min-[1100px]:flex flex-[1.5] justify-start ml-20 px-8">
             <div className="relative w-full max-w-[400px] group">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search cards, accessories..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all hover:bg-white/[0.07]"
               />
             </div>
           </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10 mx-6">
            <Link to="/" className="relative text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/cards" className="relative text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors group">
              Cards
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/marketplace" className="relative text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors group">
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
              
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Currency Selector */}
            {/* Mobile Actions - Simplified */}
            <div className="md:hidden flex items-center mr-1">
            </div>
            
            {/* Spacer for better visual balance */}
            <div className="hidden lg:block w-4"></div>

            {/* User Auth Section */}
            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group"
                    >
                        {(() => {
                            const currentAvatar = CHARACTER_AVATARS.find(a => a.id === user.selectedAvatar) || CHARACTER_AVATARS[0];
                            return currentAvatar?.image ? (
                                <img 
                                    src={currentAvatar.image} 
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full border-2 border-amber-500/30 object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 bg-slate-800 flex items-center justify-center">
                                    <span className="text-sm font-black text-amber-500 uppercase">
                                        {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            );
                        })()}
                        <span className="hidden lg:block text-sm font-bold text-slate-300 truncate max-w-[120px]">{user.displayName}</span>
                        <ArrowRight className={`w-4 h-4 text-slate-400 transform transition-transform ${userDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const currentAvatar = CHARACTER_AVATARS.find(a => a.id === user.selectedAvatar) || CHARACTER_AVATARS[0];
                                        return currentAvatar?.image ? (
                                            <img src={currentAvatar.image} alt={user.displayName} className="w-12 h-12 rounded-full border-2 border-amber-500/50 object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 bg-slate-800 flex items-center justify-center">
                                                <span className="text-xl font-black text-amber-500 uppercase">
                                                    {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold truncate">{user.displayName}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                <Link 
                                    to="/profile" 
                                    onClick={() => setUserDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
                                >
                                    <User className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">My Profile</p>
                                        <p className="text-xs text-slate-500">View your collection</p>
                                    </div>
                                </Link>
                            </div>


                            <div className="p-2 border-t border-white/10">
                                <button 
                                    onClick={() => {
                                        logout();
                                        setUserDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group w-full"
                                >
                                    <LogOut className="w-5 h-5 text-red-400" />
                                    <span className="text-sm font-bold text-red-400">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => openAuth('login')}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-105"
                >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">LOGIN</span>
                </button>
            )}
            
          </div>
      </div>

    </div>
   </nav>
    </>
  );
};

export default Navbar;
