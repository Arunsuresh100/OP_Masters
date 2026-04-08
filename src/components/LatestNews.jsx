import React from 'react';
import { Newspaper, Calendar, ArrowUpRight, Megaphone, Hash, Activity } from 'lucide-react';
import { API_URL } from '../constants';

const NewsWireItem = ({ category, title, date, link, tagColor, index, isVisible }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className={`group relative flex flex-col p-6 md:p-8 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-700 rounded-3xl overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    {/* Dynamic Background Highlight */}
    <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${tagColor} scale-y-0 group-hover:scale-y-100 transition-transform duration-500`}></div>
    
    <div className="flex flex-row items-start justify-between gap-4 w-full">
      <div className="flex-1 space-y-3">
        {/* Metadata */}
        <div className="flex items-center gap-3">
           <span className={`text-[9px] font-black uppercase tracking-[0.2em] border px-2 py-0.5 rounded-md ${tagColor.includes('amber') ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
              {category}
           </span>
           <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> {date}
           </span>
        </div>

        {/* Title & Redirection Icon */}
        <div className="relative flex items-start justify-between gap-4">
          <h4 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors duration-500 leading-tight">
            {title}
          </h4>
          <div className="shrink-0 pt-1">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-500 transform group-hover:rotate-12">
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-slate-950 transition-colors" />
             </div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA / Footer Area */}
    <div className="mt-4 md:mt-6 flex items-center justify-between border-t border-white/5 pt-4">
       <div className="flex items-center gap-4 group-hover:translate-x-1 transition-all duration-500">
          <span className="text-[8px] md:text-[9px] font-black text-slate-500 group-hover:text-amber-500/50 uppercase tracking-[0.3em]">Read Official Press</span>
       </div>
    </div>
  </a>
);

const LatestNews = () => {
    const [news, setNews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_URL}/api/news`);
                const data = await res.json();
                setNews(data);
            } catch (err) {
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
                setTimeout(() => setIsVisible(true), 100);
            }
        };
        fetchNews();
    }, []);

    return (
        <section className="relative pt-32 pb-12 px-4 sm:px-6 overflow-hidden">
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
                Authoritative updates on the One Piece Card Game ecosystem, verified by the OP MASTER editorial team.
             </p>
          </div>

          {/* News Wire Container */}
          <div className="space-y-4">
            {loading ? (
                // Loading Skeletons
                [1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/[0.01] border border-white/5 rounded-3xl h-32">
                        <div className="flex-1 space-y-4">
                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
                            <div className="h-6 bg-white/10 rounded w-3/4"></div>
                        </div>
                    </div>
                ))
            ) : (
                news.length > 0 ? (
                    news.map((item, idx) => (
                        <NewsWireItem 
                            key={idx}
                            index={idx}
                            isVisible={isVisible}
                            category={item.category}
                            title={item.title}
                            date={item.date}
                            tagColor={item.tagColor}
                            link={item.link}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500 font-bold uppercase tracking-widest">
                        No recent intelligence found. Set sail later.
                    </div>
                )
            )}
          </div>

          {/* Footer News Control */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-emerald-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Feed Status: {loading ? 'Syncing...' : 'Active'}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Hash className="w-4 h-4 text-amber-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Articles Found: {news.length}</span>
                </div>
             </div>
             <a href="https://en.onepiece-cardgame.com/topics/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-[0.3em] hover:text-amber-500 transition-colors">
                Open Official Archive <Newspaper className="w-4 h-4" />
             </a>
          </div>
        </div>
      </section>
    );
};

export default LatestNews;
