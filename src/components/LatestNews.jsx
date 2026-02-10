import React from 'react';
import { Newspaper, Calendar, ArrowUpRight, Megaphone, Hash, Activity } from 'lucide-react';

const NewsWireItem = ({ category, title, date, link, tagColor }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 rounded-3xl overflow-hidden"
  >
    {/* Dynamic Background Highlight */}
    <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${tagColor} scale-y-0 group-hover:scale-y-100 transition-transform duration-500`}></div>
    
    <div className="flex flex-col gap-3 md:gap-6 md:flex-row md:items-center flex-1">
      {/* Metadata Column */}
      <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 min-w-[120px]">
         <span className={`text-[10px] font-black uppercase tracking-[0.2em] border px-2 py-0.5 rounded-md ${tagColor.includes('amber') ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
            {category}
         </span>
         <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> {date}
         </span>
      </div>

      {/* Main Title */}
      <div className="flex-1">
         <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors duration-500 leading-tight">
            {title}
         </h4>
      </div>
    </div>

    {/* CTA / Icon */}
    <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
       <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 hidden md:flex">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Read Official Press</span>
       </div>
       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-500">
          <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-slate-950 transition-colors" />
       </div>
    </div>
  </a>
);

const LatestNews = () => {
    return (
        <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
        {/* Editorial Ambient Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl aspect-square bg-amber-500/[0.02] blur-[160px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Section Heading - Journalistic Style */}
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Live Wire</span>
                </div>
                <div className="w-[1px] h-3 bg-white/10"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OP-TCG Global Intelligence</span>
             </div>
             
             <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                LATEST RELEASES & NEWS
             </h3>
             <p className="text-sm md:text-base text-slate-500 font-medium max-w-md">
                Authoritative updates on the One Piece Card Game ecosystem, verified by the Grand Line editorial team.
             </p>
          </div>

          {/* News Wire Container */}
          <div className="space-y-4">
            <NewsWireItem 
              category="World Premire" 
              title="Official: OP-14 'The Azure Sea's Seven' English Release Scheduled for Jan 16" 
              date="FEB 10, 2026" 
              tagColor="from-amber-500 to-orange-600"
              link="https://en.onepiece-cardgame.com/news/"
            />
            
            <NewsWireItem 
              category="Meta Analysis" 
              title="Post-Regional Report: Blue Bottom Deck variants seeing 15% increase in top-cut usage" 
              date="FEB 08, 2026" 
              tagColor="from-blue-500 to-cyan-500"
              link="https://onepiece.limitlesstcg.com/"
            />

            <NewsWireItem 
              category="Stock Alert" 
              title="Distribution Notice: Second wave of EB-01 Booster Boxes arriving at major retailers" 
              date="FEB 05, 2026" 
              tagColor="from-emerald-500 to-teal-500"
              link="https://www.tcgplayer.com/"
            />
            
            <NewsWireItem 
              category="Legal Update" 
              title="Comprehensive Rulebook v1.7.2 published with specific timing adjustments for Leader Effects" 
              date="FEB 01, 2026" 
              tagColor="from-slate-500 to-slate-700"
              link="https://en.onepiece-cardgame.com/rules/"
            />
          </div>

          {/* Footer News Control */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-emerald-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Feed Status: Active</span>
                </div>
                <div className="flex items-center gap-2">
                   <Hash className="w-4 h-4 text-amber-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Articles: 154</span>
                </div>
             </div>
             <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-[0.3em] hover:text-amber-500 transition-colors">
                Open Global Archive <Newspaper className="w-4 h-4" />
             </button>
          </div>
        </div>
      </section>
    );
};

export default LatestNews;
