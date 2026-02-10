import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Database, Search } from 'lucide-react';

const AboutCards = () => {
    return (
        <section id="about" className="relative py-20 md:py-40 px-6 sm:px-12 bg-slate-950 overflow-hidden border-b border-white/5">
          {/* Tangible Lighting - Not just a gradient, but 'physical' light leaks */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              
              {/* Left Column - The Editorial Statement */}
              <div className="lg:col-span-7 space-y-10 md:space-y-14 text-left">
                
                {/* Meta Labels for Authenticity */}
                <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                  <span className="flex items-center gap-2 text-amber-500/80">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Rarity System
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                  <span>EN OP-TCG STANDARD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" /> 8 Main Tiers
                  </span>
                </div>

                <div className="space-y-6">
                  <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter">
                    Decoding <br /> 
                    <span className="relative inline-block mt-4">
                      The Scarcity
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-50"></span>
                    </span>
                  </h2>
                  <p className="text-lg md:text-2xl text-slate-300 font-medium leading-tight max-w-xl italic">
                    "Scarcity is the bedrock of collection; understanding it is the key to mastery."
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-12 pt-4">
                  <div className="flex-1 space-y-3">
                    <div className="text-amber-500 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> The Manga Chase
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                      Beyond Super Rares (SR) and Secrets (SEC) lies the most prestigious tier: **Manga Alternate Arts**. These represent the absolute pinnacle of card value, featuring iconic comic panels and a signature background that defines high-end collections.
                    </p>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" /> Pull Rates
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                      Every box break is an exercise in probability. We break down the exact hierarchy—from common foundational cards to the 1-in-cases Alternate Arts—to help you identify your most valuable pulls instantly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Architectural Visual with Real Card */}
              <div className="lg:col-span-5 relative w-full md:max-w-md lg:max-w-none mx-auto lg:mx-0">
                <div className="aspect-[4/5] bg-slate-900/50 rounded-[3rem] md:rounded-[4rem] border border-white/5 p-4 md:p-8 relative overflow-hidden group shadow-2xl">
                   
                   {/* Realistic Lighting leak on top of card */}
                   <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 blur-[120px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-1000 rotate-12"></div>

                   {/* The Card Representation */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full p-4 md:p-12">
                      <div className="w-full h-full rounded-[2.5rem] bg-slate-950 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex items-center justify-center p-2">
                         
                         {/* High Value Card Image */}
                         <img 
                            src="https://en.onepiece-cardgame.com/images/cardlist/card/OP13-118_p3.png?260130" 
                            alt="Manga Rare Pull" 
                            className="w-full h-full object-contain rounded-[2rem] shadow-2xl transform group-hover:scale-105 transition-transform duration-700" 
                         />

                         {/* Holographic light swipe animation */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-100 pointer-events-none"></div>
                      </div>
                   </div>
                   
                   {/* Technical Spec Tooltip */}
                   <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-3xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Market Index</span>
                      </div>
                      <div className="space-y-1">
                         <div className="text-xs font-bold text-slate-400">Rarity Tier</div>
                         <div className="text-sm font-black text-amber-500 uppercase">Manga Special</div>
                      </div>
                   </div>

                   {/* Floating "Inspect" button - Mobile style */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-30">
                      <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl group/btn hover:scale-110 transition-transform">
                         <Search className="w-6 h-6 text-white group-hover/btn:text-amber-500 transition-colors" />
                      </button>
                   </div>
                </div>

                {/* Vertical Text Decoration */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[100px] font-black text-white/[0.03] select-none vertical-text tracking-tighter uppercase whitespace-nowrap">
                  AUTHENTIC DATA
                </div>
              </div>
            </div>
          </div>
       </section>
    );
};

export default AboutCards;