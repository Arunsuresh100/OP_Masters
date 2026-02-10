import React, { useState, useEffect } from 'react';
import { Youtube, ChevronRight } from 'lucide-react';
import heroImage from '../assets/hero.png';

const Hero = ({ channelData }) => {
  // State to handle the entrance animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small timeout to ensure the transition is visible after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="relative w-full min-h-[550px] md:min-h-[700px] flex items-center overflow-hidden pt-12 md:pt-20 bg-slate-950">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.alphacoders.com/133/1334415.png" 
          alt="One Piece Hero" 
          className="w-full h-full object-cover opacity-20 scale-110 animate-[zoom_20s_ease-in-out_infinite]" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-12 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-5 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Youtube className="w-3 h-3 md:w-4 md:h-4" /> Official Channel
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            Discover <br /> Card <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Rarities</span>
          </h1>

          {/* Reduced size: text-lg instead of 2xl, max-w-xl for better readability */}
          <p className="text-sm md:text-lg text-slate-400 max-w-xl leading-relaxed font-medium">
            Join One Piece Masters ({channelData.handle}) as we open packs, hunt for Mangas, and build the ultimate decks!
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href={channelData.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-red-500/50 transition-all flex items-center gap-3 transform hover:scale-105"
            >
              <Youtube className="w-5 h-5" /> Subscribe Now 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 pt-6 md:pt-8 max-w-md">
             <div className="text-center md:text-left">
               <div className="text-xl md:text-2xl font-black text-white">{channelData.subscribers}</div>
               <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Subscribers</div>
             </div>
             <div className="text-center md:text-left">
               <div className="text-xl md:text-2xl font-black text-white">{channelData.videos}</div>
               <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Videos</div>
             </div>
             <div className="text-center md:text-left">
               <div className="text-xl md:text-2xl font-black text-white">{channelData.likes}</div>
               <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Views</div>
             </div>
          </div>
        </div>
        
        {/* Right Column with useEffect Loading Animation */}
        <div className="flex-1 hidden md:flex justify-end relative">
           <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 ease-out transform ${
             isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
           }`}>
             <img 
               src={heroImage} 
               alt="Luffy Gear 5" 
               className="w-full h-100 object-contain drop-shadow-2xl animate-[bounce_8s_infinite]"
               style={{ filter: 'drop-shadow(0 0 40px rgba(220, 38, 38, 0.2))' }}
             />
           </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;