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
          
          {/* SMART SEARCH - Near Logo */}
          <div className="flex items-center ml-4 lg:ml-6">
            {/* Desktop: Full Search Input (≥1100px) */}
            <div className="hidden min-[1100px]:block w-64 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search cards..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-700/50 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-amber-500 transition-all text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tablet/Mobile: Compact Icon (<1100px) */}
            <button 
              onClick={() => setMobileSearchActive(true)} 
              className="min-[1100px]:hidden p-2 text-slate-400 hover:text-amber-400 transition-all rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            <Link to="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link to="/cards" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Cards</Link>
            <Link to="/marketplace" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              Marketplace
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[8px] uppercase tracking-tighter border border-amber-500/20">Hot</span>
            </Link>
          </div>
              
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Currency Selector */}
            <div className="hidden md:flex bg-slate-800/20 border border-white/5 p-1 rounded-xl ml-3">
              <button onClick={() => setCurrency('USD')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-slate-200'}`}>USD</button>
              <button onClick={() => setCurrency('INR')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${currency === 'INR' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-slate-200'}`}>INR</button>
            </div>
            
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
                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs md:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-105"
                >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">LOGIN</span>
                </button>
            )}
            
            <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      <div className={`absolute inset-0 px-4 flex items-center gap-3 bg-slate-950 transition-all duration-300 min-[1100px]:hidden ${mobileSearchActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
             <input 
               autoFocus={mobileSearchActive}
               type="text" 
               placeholder="Search cards..." 
               className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <button onClick={() => setMobileSearchActive(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
             <X className="w-6 h-6" />
          </button>
      </div>
    </div>
   </nav>

   {/* MOBILE BOTTOM NAVIGATION */}
   <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
     <div className="grid grid-cols-4 h-16">
       {/* Home */}
       <Link
         to="/"
         className={`flex flex-col items-center justify-center gap-1 transition-all ${
           location.pathname === '/'
             ? 'text-amber-500'
             : 'text-slate-500 hover:text-slate-300'
         }`}
       >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
         </svg>
         <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
       </Link>

       {/* Cards */}
       <Link
         to="/cards"
         className={`flex flex-col items-center justify-center gap-1 transition-all ${
           location.pathname === '/cards'
             ? 'text-amber-500'
             : 'text-slate-500 hover:text-slate-300'
         }`}
       >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
         </svg>
         <span className="text-[9px] font-black uppercase tracking-wider">Cards</span>
       </Link>

       {/* Marketplace */}
       <Link
         to="/marketplace"
         className={`flex flex-col items-center justify-center gap-1 transition-all ${
           location.pathname === '/marketplace'
             ? 'text-amber-500'
             : 'text-slate-500 hover:text-slate-300'
         }`}
       >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
         </svg>
         <span className="text-[9px] font-black uppercase tracking-wider">Market</span>
       </Link>

        {/* Profile / Login */}
        {user ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/profile'
                ? 'text-amber-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              {(() => {
                const currentAvatar = CHARACTER_AVATARS.find(a => a.id === user.selectedAvatar) || CHARACTER_AVATARS[0];
                return currentAvatar?.image ? (
                  <img
                    src={currentAvatar.image}
                    alt="Profile"
                    className={`w-6 h-6 rounded-full border-2 object-cover ${
                      location.pathname === '/profile' ? 'border-amber-500' : 'border-slate-600'
                    }`}
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full border-2 bg-slate-800 flex items-center justify-center ${
                    location.pathname === '/profile' ? 'border-amber-500' : 'border-slate-600'
                  }`}>
                    <span className="text-xs font-black text-amber-500 uppercase">
                      {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                );
              })()}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider">Profile</span>
          </Link>
       ) : (
         <button
           onClick={() => openAuth('login')}
           className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition-all"
         >
           <User className="w-5 h-5" />
           <span className="text-[9px] font-black uppercase tracking-wider">Login</span>
         </button>
       )}
     </div>
   </nav>
   </>
  );
};

export default Navbar;
