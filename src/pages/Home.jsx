import React from 'react';
import { AlertCircle, Zap, X } from 'lucide-react';
import Hero from '../components/Hero';
import LatestVideos from '../components/LatestVideos';
import AboutCards from '../components/AboutCards';
import CardTypes from '../components/CardTypes';
import LatestNews from '../components/LatestNews';

const Home = ({ channelData, latestVideos, loading, appReady, searchQuery, currency }) => {
  const videosRef = React.useRef(null);
  const newsRef = React.useRef(null);
  const aboutRef = React.useRef(null);
  const [searchMsg, setSearchMsg] = React.useState(null);

  React.useEffect(() => {
    if (!searchQuery) return;
    
    const query = searchQuery.toLowerCase();
    let matched = false;

    // Latest Videos Keywords
    if (query.match(/latest|video|drop|youtube|watch/)) {
      videosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      matched = true;
    } 
    // Latest News Keywords
    else if (query.match(/news|release|update|booster|card|event/)) {
      newsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      matched = true;
    }
    // About/Info Keywords
    else if (query.match(/about|info|guide|learn/)) {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      matched = true;
    }

    if (!matched && query.length > 2) {
      setSearchMsg(`No results found for "${searchQuery}"`);
      const timer = setTimeout(() => setSearchMsg(null), 3000);
      return () => clearTimeout(timer);
    } else {
      setSearchMsg(null);
    }
  }, [searchQuery]);

  return (
    <div className={`transition-all duration-1000 ease-out ${appReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} relative`}>
      {/* Search Feedback Toast */}
      {searchMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-4 duration-500">
             <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${searchMsg.includes('No') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {searchMsg.includes('No') ? <AlertCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
             </div>
             <p className="flex-1 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-tight">
               {searchMsg}
             </p>
             <button onClick={() => setSearchMsg(null)} className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
             </button>
          </div>
        </div>
      )}

      <Hero channelData={channelData} />
      <div ref={videosRef} className="scroll-mt-20">
        <LatestVideos videos={latestVideos} loading={loading} />
      </div>
      <div ref={aboutRef} className="scroll-mt-20">
        <AboutCards id="about" />
      </div>
      <div ref={newsRef} className="scroll-mt-20">
        <LatestNews />
      </div>
    </div>
  );
};

export default Home;
