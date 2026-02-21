import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUser } from '../context/UserContext';

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

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, openAuth } = useUser();

  return (
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
  );
};

export default MobileBottomNav;
