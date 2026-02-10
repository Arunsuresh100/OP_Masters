import React, { useRef } from 'react';
import { Play, ArrowUpRight, Youtube, Clock, ChevronRight } from 'lucide-react';

const VideoSkeleton = () => (
  <div className="min-w-[280px] md:min-w-[320px] bg-slate-900/40 rounded-3xl p-3 animate-pulse border border-white/5">
     <div className="w-full aspect-video bg-slate-800/50 rounded-2xl mb-4"></div>
     <div className="h-4 bg-slate-800/50 rounded-full w-3/4 mb-3"></div>
     <div className="h-3 bg-slate-800/50 rounded-full w-1/2"></div>
  </div>
);

const LatestVideos = ({ videos = [], loading }) => {
  const scrollContainer = useRef(null);

  return (
    <section className="relative py-12 md:py-24 px-4 sm:px-6 overflow-hidden bg-slate-950">
      {/* Background Accents - Subtle & Premium */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
               <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-widest">Channel Updates</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Drops</span>
            </h3>
          </div>
          
          <a 
            href="https://www.youtube.com/@OnepieceMasters/videos" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 group"
          >
            <span className="hidden md:inline text-sm font-bold text-slate-400 group-hover:text-white transition-colors">View All</span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
               <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </a>
        </div>
        
        {loading ? (
          <div className="flex gap-4 md:gap-8 overflow-hidden mask-fade-right">
            {[...Array(4)].map((_, i) => <VideoSkeleton key={i} />)}
          </div>
        ) : (
          <div className="relative group/slider">
            <div 
              ref={scrollContainer}
              className="flex gap-4 md:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.length > 0 ? videos.map((video) => (
                <a 
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block min-w-[280px] sm:min-w-[320px] md:min-w-[360px] snap-center md:snap-start relative"
                >
                  {/* Card Image Container - Glassmorphic Border with subtle Shadow */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 group-hover:shadow-red-600/20 group-hover:border-red-500/30 group-hover:-translate-y-2">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 pb-4">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </div>
                    </div>

                    {/* Badge: New */}
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-red-500/20 shadow-lg">
                      <span className="text-[10px] font-black text-white tracking-wider uppercase">New</span>
                    </div>

                    {/* Badge: Duration */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-white flex items-center gap-1.5">
                       <Clock className="w-3 h-3" />
                       <span className="text-[10px] font-bold">{video.duration || '00:00'}</span>
                    </div>

                    {/* Content Logic Layer */}
                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-sm md:text-lg font-bold text-white leading-tight line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] md:text-xs font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                         <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300">{video.timeAgo}</span>
                         <span className="flex items-center gap-1.5 bg-red-600/10 px-2 py-0.5 rounded text-red-500">
                           <Play className="w-3 h-3 fill-current" /> {video.views} Views
                         </span>
                      </div>
                    </div>
                  </div>
                </a>
              )) : (
                <div className="w-full py-12 text-center border border-white/5 rounded-3xl bg-slate-900/30">
                  <p className="text-slate-500 font-medium">No videos found at the moment.</p>
                </div>
              )}
              
              {/* 'View All' Final Card - App like interaction */}
              <a 
                href="https://www.youtube.com/@OnepieceMasters/videos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center min-w-[280px] sm:min-w-[320px] md:min-w-[360px] aspect-video rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 hover:border-amber-500/30 transition-all snap-center md:snap-start hover:shadow-2xl hover:shadow-amber-500/5 group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-45">
                   <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <span className="text-base font-bold text-white group-hover:text-amber-400 tracking-tight">Visit Channel</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">View All Videos</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestVideos;