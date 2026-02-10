import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Bell, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Crown,
  Gem,
  Star,
  Search,
  Menu,
  X,
  ArrowUpRight,
  Youtube,
  Play,
  ShoppingCart,
  Users,
  Clock
} from 'lucide-react';

const USD_TO_INR = 83.5;
const API_KEY = 'AIzaSyB3JbL6gT9m-IadtGVDJc1qwYb-68JYk38';
const CHANNEL_HANDLE = 'OnepieceMasters'; 
const CHANNEL_LOGO_URL = 'https://yt3.googleusercontent.com/z6rQcZJc1FCx3Edymkt5UgtdBe4GtIUGiVr8y--N6BYbYeo52PeVHhdLyEQ3aLEiYsc1j-v6=s160-c-k-c0x00ffffff-no-rj';



// Helper: Convert ISO8601 duration to seconds (e.g., PT1M5S -> 65)
const parseDuration = (isoDuration) => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  
  return (hours * 3600) + (minutes * 60) + seconds;
};

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// New Skeleton Loader Component
const VideoSkeleton = () => (
  <div className="min-w-[320px] w-[320px] bg-slate-800/50 rounded-2xl p-4 animate-pulse border border-white/5">
     <div className="w-full aspect-video bg-slate-700/50 rounded-xl mb-4"></div>
     <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
     <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
  </div>
);

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

const App = () => {
  const [currency, setCurrency] = useState('USD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true); // Specific loader for videos
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelData, setChannelData] = useState({
    name: 'One Piece Masters',
    handle: '@OnepieceMasters',
    url: 'https://www.youtube.com/@OnepieceMasters',
    subscribers: '---',
    videos: '---',
    likes: '---',
    avatar: CHANNEL_LOGO_URL 
  });
  const [latestVideos, setLatestVideos] = useState([]);

  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        setLoading(true);
        // 1. Channel ID Search
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&key=${API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (!searchData.items || searchData.items.length === 0) throw new Error('Channel not found.');
        const channelId = searchData.items[0].id.channelId;

        // 2. Channel Details
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelDetails = await channelResponse.json();
        const channelItem = channelDetails.items[0];
        
        setChannelData({
          name: channelItem.snippet.title,
          handle: channelItem.snippet.customUrl || '@OnepieceMasters',
          url: `https://www.youtube.com/channel/${channelId}`,
          subscribers: parseInt(channelItem.statistics.subscriberCount).toLocaleString(),
          videos: parseInt(channelItem.statistics.videoCount).toLocaleString(),
          likes: parseInt(channelItem.statistics.viewCount).toLocaleString(),
          avatar: CHANNEL_LOGO_URL 
        });

        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        // 3. Videos (Robust Fetch for Length)
        setVideoLoading(true);
        // Get more items initially (30) to ensure we have enough after filtering shorts
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=30&key=${API_KEY}`;
        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (playlistData.items) {
           // Get IDs to fetch duration
           const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
           
           // Fetch Video Details for Duration
           const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
           const durationResponse = await fetch(durationUrl);
           const durationData = await durationResponse.json();
           
           // Map durations to IDs
           const durationMap = {};
           durationData.items.forEach(v => {
              durationMap[v.id] = parseDuration(v.contentDetails.duration);
           });

           // Filter: Must be > 60 seconds (Shorts limit is usually 60s)
           const longFormVideos = playlistData.items.filter(item => {
              const duration = durationMap[item.contentDetails.videoId];
              // YouTube shorts can be up to 60s, playing it safe with 65s filter
              return duration > 65; 
           }).slice(0, 6); // Take top 6 long videos

           const formattedVideos = longFormVideos.map(item => ({
             id: item.contentDetails.videoId,
             title: item.snippet.title,
             thumbnail: item.snippet.thumbnails.maxres ? item.snippet.thumbnails.maxres.url : (item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.medium.url),
             timeAgo: timeAgo(item.snippet.publishedAt),
             duration: durationMap[item.contentDetails.videoId] 
           }));
           
           setLatestVideos(formattedVideos);
        }
        setLoading(false);
        setVideoLoading(false);

      } catch (err) {
        console.error("YouTube Fetch Error:", err);
        setLoading(false);
        setVideoLoading(false);
      }
    };
    fetchYouTubeData();
  }, []);

  const formatPrice = (val) => {
    if (currency === 'INR') {
       return `₹${(val * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
           <a href={channelData.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group cursor-pointer">
             <div className="relative">
               <img src={CHANNEL_LOGO_URL} alt="Logo" className="relative w-12 h-12 rounded-full object-cover bg-black border border-white/10" />
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">OP MASTERS</span>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Card Opening Channel</span>
             </div>
           </a>
           
           <div className="hidden md:flex items-center gap-6 flex-1 justify-center max-w-md">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search cards, sets..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 sm:text-sm transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
           </div>

           <div className="flex items-center gap-3">
             <div className="flex bg-slate-800/50 border border-white/10 p-1 rounded-xl backdrop-blur-sm">
               <button onClick={() => setCurrency('USD')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>USD</button>
               <button onClick={() => setCurrency('INR')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>INR</button>
             </div>
             <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
           </div>
         </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden pt-20">
         <div className="absolute inset-0 z-0">
           <img src="https://images.alphacoders.com/133/1334415.png" alt="One Piece Hero" className="w-full h-full object-cover opacity-30 scale-110 animate-[zoom_20s_ease-in-out_infinite]" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
         </div>
         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Youtube className="w-4 h-4" /> Official Channel
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                Discover <br /> Card <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Rarities</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl leading-relaxed font-medium">
                Join One Piece Masters ({channelData.handle}) as we open packs, hunt for Mangas, and build the ultimate decks!
              </p>
              <div className="flex flex-wrap gap-4 pt-6">
                <a href={channelData.url} target="_blank" rel="noopener noreferrer" className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-red-500/50 transition-all flex items-center gap-3 transform hover:scale-105">
                  <Youtube className="w-5 h-5" /> Subscribe Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 max-w-xl">
                 <div className="text-center">
                   <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.subscribers}</div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Subscribers</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.videos}</div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Videos Posted</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{channelData.likes}</div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Views</div>
                 </div>
              </div>
            </div>
         </div>
      </header>

      {/* Improved Latest Uploads Section */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] -translate-y-1/2 rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                   <Play className="w-5 h-5 text-red-500" fill="currentColor" />
                 </div>
                 <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Latest Openings</h3>
              </div>
              <p className="text-base text-slate-400 font-medium max-w-lg">
                 Catch up on the newest box breaks, deck profiles, and rare pulls. 
                 <span className="text-amber-500 font-bold ml-1">Full content only, no shorts.</span>
              </p>
            </div>
            
            <a href="https://www.youtube.com/@OnepieceMasters/videos" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group">
               View All Videos <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          
          {videoLoading ? (
             <div className="flex gap-6 overflow-hidden">
                <VideoSkeleton />
                <VideoSkeleton />
                <VideoSkeleton />
                <VideoSkeleton />
             </div>
          ) : (
            <div className="relative group/slider">
              {/* Main Scroll Container */}
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {latestVideos.map((video) => (
                  <a 
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group block min-w-[320px] w-[320px] snap-start relative transform transition-all hover:-translate-y-1"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-lg group-hover:shadow-red-900/20 transition-all">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>

                      {/* Duration Badge (Mocked or calculated if fetched) */}
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Clock className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white tracking-wider">VIDEO</span>
                      </div>
                    </div>

                    {/* Content */}
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
                ))}
                
                {/* See All Card */}
                <a 
                  href="https://www.youtube.com/@OnepieceMasters/videos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center min-w-[320px] w-[320px] aspect-video rounded-2xl bg-slate-800/50 border border-white/10 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all snap-start cursor-pointer"
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

      

      

      

      
       {/* Footer */}
      
      <style>{`@keyframes zoom { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
};

export default App;