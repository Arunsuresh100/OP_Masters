import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const NewsItem = ({ title, date, category, gradient, link }) => (
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer backdrop-blur-sm block"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/70 rounded-full mb-3">
          {category}
        </span>
        <h4 className="text-base font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors leading-snug">
          {title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">{date}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>
    </a>
  );

const LatestNews = () => {
    return (
        <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/10 to-orange-600/10 blur-[120px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30">
                  {/* Bell Icon from Lucide needs to be imported if used here, or passed as prop. 
                      Since user prompt said 'call functions', I'll just import Bell here. */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <div><h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Latest News</h3><p className="text-sm text-slate-500 font-semibold uppercase tracking-widest mt-1">Stay Updated</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NewsItem category="New Release" title="OP-10: Sovereignty of Kings Visual Reveal" date="FEB 2026" gradient="from-purple-600 to-pink-600" link="https://en.onepiece-cardgame.com/products/boosters/op10.php"/>
            <NewsItem category="Price Alert" title="Manga Rare Shanks Reaches All-Time High" date="JAN 2026" gradient="from-amber-500 to-orange-600" link="https://www.tcgplayer.com/search/one-piece-card-game/product"/>
            <NewsItem category="Meta Shift" title="Black/Yellow Deck dominance affects SR supply" date="JAN 2026" gradient="from-blue-600 to-cyan-600" link="https://onepiece.limitlesstcg.com/decks"/>
          </div>
        </div>
      </section>
    );
};

export default LatestNews;
