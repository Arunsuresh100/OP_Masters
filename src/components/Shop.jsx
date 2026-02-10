import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PURCHASE_OPTIONS } from '../constants';
import { formatPrice } from '../utils';

const Shop = ({ currency }) => {
    return (
        <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/10 to-orange-600/10 blur-[120px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12"><h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Get Your Packs</h3><p className="text-slate-400 text-lg">Start your card collection journey today</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PURCHASE_OPTIONS.map((option, index) => (
              <a key={index} href={option.link} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4"><span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-full">{option.tag}</span><ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" /></div>
                  <h4 className="text-xl font-bold text-white mb-2">{option.name}</h4>
                  <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formatPrice(option.price, currency, 83.5)}</div>
                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold uppercase rounded-xl shadow-lg hover:shadow-2xl transition-all group-hover:scale-105">Purchase Now</button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
};

export default Shop;
