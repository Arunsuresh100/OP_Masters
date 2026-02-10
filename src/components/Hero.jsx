import React from 'react';
import { Youtube, ChevronRight } from 'lucide-react';
import heroImage from '../assets/hero.png';

const Hero = ({ channelData }) => {
  return (
    <header className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden pt-20">
       <div className="absolute inset-0 z-0">
         <img src="https://images.alphacoders.com/133/1334415.png" alt="One Piece Hero" className="w-full h-full object-cover opacity-30 scale-110 animate-[zoom_20s_ease-in-out_infinite]" />
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
       </div>
       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Youtube className="w-4 h-4" /> Official Channel
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter">
              Discover <br /> Card <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Rarities</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl leading-relaxed font-medium">
              Join One Piece Masters ({channelData.handle}) as we open packs, hunt for Mangas, and build the ultimate decks!
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <a href={channelData.url} target="_blank" rel="noopener noreferrer" className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-red-500/50 transition-all flex items-center gap-3 transform hover:scale-105">
                <Youtube className="w-5 h-5" /> Subscribe Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 max-w-xl">
               <div className="text-center">
                 <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.subscribers}</div>
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Subscribers</div>
               </div>
               <div className="text-center">
                 <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.videos}</div>
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Videos Posted</div>
               </div>
               <div className="text-center">
                 <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.likes}</div>
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Views</div>
               </div>
            </div>
          </div>
          
          {/* Right Column: Hero Image with Custom Bounce Animation (8s) */}
          <div className="flex-1 hidden md:flex justify-end relative">
             <div className="relative z-10 w-full max-w-lg">
               <img 
                 src={heroImage} 
                 alt="Luffy Gear 5" 
                 className="w-full h-auto object-contain drop-shadow-2xl animate-[bounce_8s_infinite]"
                 style={{ filter: 'drop-shadow(0 0 50px rgba(220, 38, 38, 0.3))' }}
               />
             </div>
          </div>
       </div>
    </header>
  );
};

export default Hero;
