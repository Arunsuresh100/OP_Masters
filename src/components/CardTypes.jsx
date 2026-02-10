import React from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { RARITIES } from '../constants';
import { formatPrice } from '../utils';

const CardTypes = ({ searchQuery, currency }) => {
  const filteredRarities = RARITIES.filter(r => 
    searchQuery === '' || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-16">
      {filteredRarities.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 rounded-2xl bg-slate-800/50 border border-white/10 mb-4">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white">No results found</h3>
            <p className="text-slate-400 mt-2">We couldn't find any card rarities matching "{searchQuery}"</p>
          </div>
        </div>
      ) : (
        filteredRarities.map((rarity) => {
          const IconComponent = rarity.icon;
          return (
            <section key={rarity.id} id={rarity.id} className="scroll-mt-24 border-b border-white/5 pb-16 last:border-0 last:pb-0">
              <div className="flex flex-col gap-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                  {/* Left Side: Badge and Icon */}
                  <div className="flex items-start gap-5 lg:w-auto">
                    <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${rarity.gradient} flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform flex-shrink-0`}>
                      <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
                      <IconComponent className="relative z-10 w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${rarity.textColor} bg-white/5 rounded-full mb-2`}>{rarity.tag}</span>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{rarity.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-auto px-3 h-8 rounded-lg bg-gradient-to-br ${rarity.gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-xs font-black text-white whitespace-nowrap">{rarity.code}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Pricing Card */}
                  <div className={`lg:flex-1 relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/30 border ${rarity.borderColor} rounded-2xl backdrop-blur-sm`}>
                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${rarity.gradient} opacity-5 blur-3xl`}></div>
                    <div className="relative z-10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" /> Collector's Value
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase">Hobby</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">From</span>
                          <span className="text-2xl font-black text-white">{formatPrice(rarity.minPrice, currency, 83.5)}</span>
                        </div>
                        <div className="w-12 h-[2px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full"></div>
                        <div className="flex-1 text-right">
                          <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">To</span>
                          <span className="text-2xl font-black text-white">{formatPrice(rarity.maxPrice, currency, 83.5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Examples */}
                <p className="text-base text-slate-400 leading-relaxed max-w-4xl">{rarity.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
                  {rarity.examples.map((card, idx) => (
                    <div key={idx} className="group space-y-4 w-full max-w-[200px]">
                      <div className={`relative aspect-[2/2.8] rounded-2xl bg-slate-800 border ${rarity.borderColor} overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]`}>
                        <img 
                          src={card.img} 
                          alt={card.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = "https://placehold.co/400x560/1e293b/white?text=No+Image"; }} 
                        />
                      </div>
                      <div className="px-1 space-y-1 text-center">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">{card.name}</h4>
                        <div className="flex justify-between items-center px-2">
                          <p className="text-[11px] text-slate-500 font-mono tracking-wider">{card.set}</p>
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}
    </main>
  );
};

export default CardTypes;