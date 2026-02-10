import React from 'react';
import { Play, ArrowUpRight, Youtube, Clock } from 'lucide-react';

const VideoSkeleton = () => (
  <div className="min-w-[320px] w-[320px] bg-slate-800/50 rounded-2xl p-4 animate-pulse border border-white/5">
     <div className="w-full aspect-video bg-slate-700/50 rounded-xl mb-4"></div>
     <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
     <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
  </div>
);

const LatestVideos = ({ videos = [], loading }) => {
  return (
    <section className="relative py-12 md:py-24 px-4 sm:px-6 overflow-hidden bg-slate-950">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] -translate-y-1/2 rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-1.5 md:p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                 <Play className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="currentColor" />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">Latest Openings</h3>
            </div>
            <p className="text-base text-slate-400 font-medium max-w-lg">
               Catch up on the newest box breaks, deck profiles, and rare pulls.
            </p>
          </div>
          
          <a 
            href="https://www.youtube.com/@OnepieceMasters/videos" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group"
          >
            View All Videos <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
        
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => <VideoSkeleton key={i} />)}
          </div>
        ) : (
          <div className="relative group/slider">
            <div 
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.length > 0 ? videos.map((video) => (
                <a 
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block min-w-[320px] w-[320px] snap-start relative transform transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-lg group-hover:shadow-red-900/20 transition-all">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-bold text-white tracking-wider">NEW</span>
                    </div>
                  </div>

                  <div className="mt-4 px-1">
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> ON YOUTUBE
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span className="text-slate-400">{video.timeAgo}</span>
                    </div>
                  </div>
                </a>
              )) : (
                <p className="text-slate-500">No videos found.</p>
              )}
              
              {/* See All Card */}
              <a 
                href="https://www.youtube.com/@OnepieceMasters/videos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center min-w-[320px] w-[320px] aspect-video rounded-2xl bg-slate-800/50 border border-white/10 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all snap-start"
              >
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors shadow-lg group-hover:scale-110 duration-300">
                   <ArrowUpRight className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-white group-hover:text-amber-400">View Channel</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest mt-2">More Videos</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestVideos;