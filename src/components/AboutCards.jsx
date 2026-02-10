import React from 'react';
import { Crown } from 'lucide-react';

const AboutCards = () => {
    return (
        <section className="relative py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-white/5 my-24 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Crown className="w-4 h-4" /> Ultimate Guide
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
              One Piece <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Card Types</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-light">
              Understanding the rarity system is crucial for every collector and player. 
              From the humble Commons to the prestigious Manga Rares, each card type serves a unique purpose. 
              Explore the hierarchy below to learn what to look for!
            </p>
         </div>
         {/* Decorative Background for Intro */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-gradient-to-r from-amber-500/20 to-transparent rounded-full blur-[150px]"></div>
         </div>
      </section>
    );
};

export default AboutCards;
