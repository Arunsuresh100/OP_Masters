import React from 'react';
import { ArrowUpRight, Newspaper, Calendar, Hash, Zap } from 'lucide-react';

const NewsCard = ({ title, date, category, gradient, link, isFeatured = false }) => (
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden flex flex-col justify-end bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-[2rem] transition-all duration-700 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ${isFeatured ? 'md:col-span-2 aspect-[4/5] md:aspect-auto min-h-[300px] md:h-[450px]' : 'aspect-square'}`}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity duration-700`}></div>
      
      {/* Animated Light Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[news-sweep_3s_infinite] pointer-events-none"></div>

      {/* Content Layer */}
      <div className="relative z-10 p-6 md:p-10 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 rounded-full text-white/80`}>
            {category}
          </span>
          {isFeatured && (
            <span className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-amber-500 text-slate-950 rounded-full">
              <Zap className="w-3 h-3 fill-current" /> Hot Topic
            </span>
          )}
        </div>
        
        <h4 className={`${isFeatured ? 'text-2xl md:text-5xl' : 'text-lg md:text-2xl'} font-black text-white leading-[0.9] tracking-tighter group-hover:text-amber-400 transition-colors duration-500`}>
          {title}
        </h4>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5" /> {date}
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Hash className="w-3.5 h-3.5" /> Official
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400 group-hover:scale-110 transition-all duration-500">
             <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-950 transition-colors" />
          </div>
        </div>
      </div>
    </a>
  );

const LatestNews = () => {
    return (
        <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
        {/* Editorial Background Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-video bg-amber-500/5 blur-[160px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Pro Header */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 px-4">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                     <Newspaper className="w-6 h-6 text-slate-950" />
                  </div>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-[0.4em]">Official Bulletin</span>
               </div>
               <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                 LATEST NEWS
               </h3>
               <p className="text-sm md:text-base text-slate-400 font-medium max-w-md">
                 Stay ahead of the meta with verified release data, market fluctuations, and official event coverage.
               </p>
            </div>
            
            <button className="hidden md:flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all">
               Browse Archive <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {/* FEATURED: OP14 RELEASE */}
            <NewsCard 
              isFeatured 
              category="World Premire" 
              title="OP-14: The Azure Sea's Seven English Release Details Revealed" 
              date="JAN 16, 2026" 
              gradient="from-blue-600 to-emerald-600" 
              link="https://en.onepiece-cardgame.com/products/boosters/op14.php"
            />
            
            <NewsCard 
              category="Card Breakdown" 
              title="Mihawk OP14: How the Green Green Meta is Shifting" 
              date="FEB 2026" 
              gradient="from-green-600 to-slate-700" 
              link="https://onepiece.limitlesstcg.com/"
            />
            
            <NewsCard 
              category="Market Peak" 
              title="Manga Rare Boa Hancock reaches new pricing heights" 
              date="FEB 2026" 
              gradient="from-pink-600 to-purple-800" 
              link="https://www.tcgplayer.com/"
            />

            {/* Layout spacer for mobile visual balance or future expansion */}
          </div>
        </div>

        <style>{`
          @keyframes news-sweep {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.2; }
            100% { transform: translateX(200%); opacity: 0; }
          }
        `}</style>
      </section>
    );
};

export default LatestNews;
