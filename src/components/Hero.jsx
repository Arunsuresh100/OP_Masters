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
    <header className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden pt-20 bg-slate-950">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.alphacoders.com/133/1334415.png" 
          alt="One Piece Hero" 
          className="w-full h-full object-cover opacity-20 scale-110 animate-[zoom_20s_ease-in-out_infinite]" 
          // Only load the big image, but for mobile maybe a smaller one? Keeping it simple.
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm mx-auto md:mx-0">
            <Youtube className="w-3 h-3 md:w-4 md:h-4" /> Official Channel
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-lg">
            Discover <br /> Card <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Rarities</span>
          </h1>

          <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium drop-shadow-md">
            Join OP MASTER ({channelData.handle}) as we open packs, hunt for Mangas, and build the ultimate decks!
          </p>
          
          {/* Main CTA */}
          <div className="flex justify-center md:justify-start">
             <a 
               href={channelData.url} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="group relative px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-sm md:text-base hover:shadow-2xl hover:shadow-red-600/40 transition-all flex items-center gap-3 transform hover:scale-[1.03]"
             >
               <span className="relative z-10 flex items-center gap-2">
                 <Youtube className="w-5 h-5" /> Subscribe Now
               </span>
               <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-0"></div>
             </a>
          </div>

          {/* Premium Glass Stats Bar */}
         {/* Premium Glass Stats Bar - Balanced Medium Size */}
<div className="grid grid-cols-3 divide-x divide-white/10 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 shadow-xl max-w-sm mx-auto md:mx-0 mt-6">
  <div className="text-center px-2">
    <div className="text-base md:text-xl font-black text-white tracking-tight">
      {channelData.subscribers}
    </div>
    <div className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
      Subscribers
    </div>
  </div>
  <div className="text-center px-2">
    <div className="text-base md:text-xl font-black text-white tracking-tight">
      {channelData.videos}
    </div>
    <div className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
      Videos
    </div>
  </div>
  <div className="text-center px-2">
    <div className="text-base md:text-xl font-black text-white tracking-tight">
      {channelData.views}
    </div>
    <div className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
      Views
    </div>
  </div>
</div>
        </div>
        
        {/* Right Image (Now Visible on Mobile but resized) */}
        <div className="flex-1 w-full max-w-[240px] md:max-w-[340px] lg:max-w-lg justify-center md:justify-end relative mt-8 md:mt-0">
           <div className={`relative z-10 w-full transition-all duration-1000 ease-out transform ${
             isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
           }`}>
             <img 
               src={heroImage} 
               alt="Luffy Gear 5" 
               className="w-full h-100 object-contain drop-shadow-2xl animate-[bounce_6s_infinite] select-none pointer-events-none"
               style={{ filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.3))' }}
             />
             {/* Glow Effect behind image */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/20 blur-[60px] rounded-full -z-10 animate-pulse"></div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;