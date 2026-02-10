import React from 'react';
import { Search, Menu, X, Instagram, Youtube } from 'lucide-react';
import { CHANNEL_LOGO_URL } from '../constants';

const Navbar = ({ 
  currency, 
  setCurrency, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  searchQuery, 
  setSearchQuery,
  channelUrl 
}) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
         <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group cursor-pointer">
           <div className="relative">
             <img src={CHANNEL_LOGO_URL} alt="Logo" className="relative w-12 h-12 rounded-full object-cover bg-black border border-white/10" />
           </div>
           <div className="flex flex-col">
             <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">OP MASTERS</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Card Opening Channel</span>
           </div>
         </a>
         
         <div className="hidden md:flex items-center gap-6 flex-1 justify-center max-w-md">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search cards, sets..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 sm:text-sm transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
         </div>

         <div className="flex items-center gap-3">
           <div className="flex bg-slate-800/50 border border-white/10 p-1 rounded-xl backdrop-blur-sm">
             <button onClick={() => setCurrency('USD')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>USD</button>
             <button onClick={() => setCurrency('INR')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>INR</button>
           </div>
           <a href="https://www.instagram.com/masterztcgverse/" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
             <Instagram className="w-6 h-6" />
           </a>
           <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>
       </div>

      {/* Mobile Menu Overlay */}
      <div className={`absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 md:hidden flex flex-col p-6 gap-6 shadow-2xl ${mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          
          {/* Mobile Search */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search cards..."
              className="block w-full pl-10 pr-3 py-3 border border-slate-700/50 rounded-xl bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing Region</h4>
             <div className="bg-slate-900/50 p-1 rounded-xl flex">
                <button onClick={() => setCurrency('USD')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'}`}>USD</button>
                <button onClick={() => setCurrency('INR')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400'}`}>INR</button>
             </div>
          </div>

          <div className="space-y-3 pb-4">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Community</h4>
             <div className="grid grid-cols-2 gap-3">
               <a href="https://www.instagram.com/masterztcgverse/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all group">
                 <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-bold text-slate-300">Instagram</span>
               </a>
               <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all group">
                 <Youtube className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-bold text-slate-300">YouTube</span>
               </a>
             </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
