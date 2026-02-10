import React from 'react';
import { ShoppingCart, Zap, ShieldCheck, Package, ExternalLink, ArrowRight } from 'lucide-react';
import { PURCHASE_OPTIONS } from '../constants';
import { formatPrice } from '../utils';

const ShopCard = ({ option, currency }) => (
  <a 
    href={option.link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="group relative flex-shrink-0 w-[280px] md:w-[350px] overflow-hidden bg-slate-950/40 border border-white/5 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 hover:border-amber-500/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] snap-center"
  >
    {/* Ambient Glow */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    
    {/* Top Section - Image/Icon Area */}
    <div className="relative p-8 pb-0">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Package className="w-4 h-4 text-amber-500" />
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{option.tag}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
             <ShieldCheck className="w-3 h-3" /> Secure
          </div>
       </div>

       <h4 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter mb-4 group-hover:text-amber-400 transition-colors">
          {option.name}
       </h4>
       
       <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
             <Zap className="w-3.5 h-3.5 text-amber-500" /> Guaranteed Pull Rates
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
             <ExternalLink className="w-3.5 h-3.5 text-slate-600" /> Worldwide Shipping
          </div>
       </div>
    </div>

    {/* Price & Action Area */}
    <div className="relative p-8 mt-auto bg-white/[0.02] border-t border-white/5">
       <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Value</span>
             <div className="text-4xl font-black text-white tracking-tighter">
                {formatPrice(option.price, currency, 83.5)}
             </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-amber-500 transition-colors duration-500">
             <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-slate-950 transition-colors" />
          </div>
       </div>

       <button className="relative w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.3em] transition-all overflow-hidden group/btn">
          <span className="relative z-10 flex items-center justify-center gap-2">
            Secure Assets <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500"></div>
       </button>
    </div>
  </a>
);

const Shop = ({ currency }) => {
    return (
        <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
        {/* Marketplace Atmospheric Light */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-amber-500/5 blur-[160px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Marketplace Header */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8 px-4">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <ShoppingCart className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-[0.4em]">Inventory Center</span>
               </div>
               <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                 MARKETPLACE
               </h3>
               <p className="text-sm md:text-base text-slate-400 font-medium max-w-md">
                 Acquire the latest boosters and booster boxes directly from verified global distributors.
               </p>
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Status</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Stock Live</span>
                </div>
            </div>
          </div>

          {/* Scrolling Marketplace Cards */}
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 -mx-4 scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:mx-0">
            {PURCHASE_OPTIONS.map((option, index) => (
              <ShopCard key={index} option={option} currency={currency} />
            ))}
          </div>

          {/* Mobile Swipe Indicator */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-50">
             <ArrowRight className="w-3 h-3 animate-bounce" /> Swipe to Browse Cards
          </div>
        </div>
      </section>
    );
};

export default Shop;
