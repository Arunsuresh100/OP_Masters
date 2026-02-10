import React from 'react';
import { TrendingUp, ExternalLink, ShieldCheck, Zap, Info, Bell, ShoppingCart, MousePointer2 } from 'lucide-react';
import { RARITIES } from '../constants';
import { formatPrice } from '../utils';

const CardTypes = ({ searchQuery, currency }) => {
  const filteredRarities = RARITIES.filter(r => 
    searchQuery === '' || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-40 space-y-24 md:space-y-32">
      {filteredRarities.length === 0 ? (
        <div className="text-center py-40">
          <div className="inline-block p-10 rounded-[3rem] bg-slate-900/50 border border-white/5 backdrop-blur-2xl shadow-3xl">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
               <TrendingUp className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Data unavailable</h3>
            <p className="text-slate-500 mt-3 max-w-xs mx-auto text-sm font-medium">No results found for your query.</p>
          </div>
        </div>
      ) : (
        filteredRarities.map((rarity) => {
          const IconComponent = rarity.icon;
          return (
            <section key={rarity.id} id={rarity.id} className="scroll-mt-32 relative group">
              
              {/* Atmospheric Light System - Ambient Leak */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl aspect-square bg-gradient-to-br ${rarity.gradient} opacity-[0.05] blur-[160px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-[0.08]`}></div>
              
              <div className="relative z-10 space-y-10 md:space-y-16">
                
                {/* 10-Year Pro Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  
                  {/* Left Column: Technical Identification */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-6">
                      {/* Technical Icon Container - Slightly Smaller */}
                      <div className="relative flex-shrink-0">
                         <div className={`absolute inset-0 bg-gradient-to-br ${rarity.gradient} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700`}></div>
                         <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-slate-950 border border-white/10 p-0.5 shadow-2l overflow-hidden`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${rarity.gradient} opacity-10`}></div>
                            <div className="w-full h-full flex items-center justify-center relative">
                               <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" strokeWidth={2} />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                           <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${rarity.textColor} border ${rarity.borderColor} rounded-md bg-white/5 backdrop-blur-md`}>
                             {rarity.tag}
                           </span>
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3" /> EN-Verified
                           </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter leading-[0.9]">
                          {rarity.name}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="relative pl-5 border-l-2 border-white/5 py-1">
                       <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium opacity-80">
                         {rarity.description}
                       </p>
                    </div>
                  </div>

                  {/* Right Column: Fintech Market Widget - Scaled Down */}
                  <div className="lg:col-span-7">
                    <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 overflow-hidden shadow-2xl group/widget">
                      <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full space-y-5">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                   <TrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Market Index</span>
                             </div>
                             <div className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white/[0.02] p-4 md:p-5 rounded-2xl border border-white/5 gap-6">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Floor</span>
                              <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter">
                                {formatPrice(rarity.minPrice, currency, 83.5)}
                              </span>
                            </div>
                            <div className="h-8 w-[1px] bg-white/5 rotate-12"></div>
                            <div className="space-y-1 text-right">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Peak</span>
                              <span className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${rarity.gradient} bg-clip-text text-transparent tracking-tighter`}>
                                {formatPrice(rarity.maxPrice, currency, 83.5)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex md:flex-col gap-3">
                           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest transition-all">
                              <Bell className="w-3.5 h-3.5" /> Notify
                           </button>
                           <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${rarity.gradient} rounded-xl text-[10px] font-bold text-white uppercase tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-95`}>
                              <ShoppingCart className="w-3.5 h-3.5" /> Buy
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Immersive Grid System - 4 columns on large screens to make cards smaller */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <h4 className="flex-shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Historical Drops</h4>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {rarity.examples.map((card, idx) => (
                      <div key={idx} className="group/card space-y-4">
                        {/* Smaller Card Container */}
                        <div className={`relative aspect-[2/2.8] rounded-2xl md:rounded-[2rem] bg-slate-900 border border-white/5 overflow-hidden shadow-xl transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]`}>
                          
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out z-20 pointer-events-none"></div>
                          
                          <img 
                            src={card.img} 
                            alt={card.name} 
                            className="w-full h-full object-cover transition-all duration-1000 group-hover/card:scale-105"
                            loading="lazy"
                            onError={(e) => { e.target.src = "https://placehold.co/400x560/1e293b/white?text=No+Card"; }} 
                          />
                          
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-4 group-hover/card:translate-y-0 z-30">
                             <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl">
                                   <MousePointer2 className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">Detail View</span>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-1 px-1 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${rarity.gradient}`}></div>
                             <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{card.set}</span>
                          </div>
                          <h4 className="text-sm md:text-base font-bold text-white group-hover/card:text-amber-500 transition-colors tracking-tight line-clamp-1">
                            {card.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>
          );
        })
      )}

      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(200%); opacity: 0; }
        }
      `}</style>
    </main>
  );
};

export default CardTypes;
