import React, { useState, useEffect } from 'react';
import heroImage from './assets/hero.png';
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
  Clock,
  Instagram
} from 'lucide-react';

const USD_TO_INR = 84; 
const API_KEY = 'AIzaSyB3JbL6gT9m-IadtGVDJc1qwYb-68JYk38';
const CHANNEL_HANDLE = 'OnepieceMasters'; 
const CHANNEL_LOGO_URL = 'https://yt3.googleusercontent.com/z6rQcZJc1FCx3Edymkt5UgtdBe4GtIUGiVr8y--N6BYbYeo52PeVHhdLyEQ3aLEiYsc1j-v6=s160-c-k-c0x00ffffff-no-rj';

// Updated with User's Specific Data & Image Links
const RARITIES = [
  {
    id: 'common',
    code: 'C',
    name: 'Common',
    description: 'The foundation of any One Piece TCG deck. While they are the most frequently pulled cards in a pack, Commons often include essential utility characters (2k counters), searchers, and event cards that are staples in competitive play. Don\'t overlook them just because they are plentiful!',
    minPrice: 0.05,
    maxPrice: 0.20,
    tag: 'Base Tier',
    gradient: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-600/30',
    textColor: 'text-slate-400',
    icon: Shield,
    examples: [
      { name: 'Market Price: $0.06', set: 'OP01-001', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454520_in_600x600.jpg' },
      { name: 'Market Price: $6.79', set: 'OP01-016', img: 'https://tcgplayer-cdn.tcgplayer.com/product/453507_in_600x600.jpg' },
      { name: 'Market Price: $0.04', set: 'OP01-006', img: 'https://tcgplayer-cdn.tcgplayer.com/product/541598_in_600x600.jpg' }
    ]
  },
  {
    id: 'uncommon',
    code: 'UC',
    name: 'Uncommon',
    description: 'A step up in complexity from Commons, Uncommon cards introduce more specialized effects and stronger power levels. These cards often define the specific strategies of a color or archetype, providing key synergy pieces that support your Leader\'s game plan.',
    minPrice: 0.20,
    maxPrice: 1.00,
    tag: 'Step Up',
    gradient: 'from-emerald-600 to-emerald-800',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: TrendingUp,
    examples: [
      { name: 'Market Price: $4.67', set: 'OP01-025', img: 'https://tcgplayer-cdn.tcgplayer.com/product/593439_in_600x600.jpg' },
      { name: 'Market Price: $4.67', set: 'OP01-013', img: 'https://tcgplayer-cdn.tcgplayer.com/product/593439_in_600x600.jpg' },
      { name: 'Market Price: $0.15', set: 'OP01-042', img: 'https://tcgplayer-cdn.tcgplayer.com/product/516752_in_600x600.jpg' }
    ]
  },
  {
    id: 'rare',
    code: 'R',
    name: 'Rare',
    description: 'Easily identified by their holographic name text and borders, Rare cards are the workhorses of high-level decks. Every pack guarantees at least one Rare or higher, and these cards typically feature powerful on-play effects or strong stat lines that can swing the momentum in your favor.',
    minPrice: 1.00,
    maxPrice: 5.00,
    tag: 'Foil Tier',
    gradient: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Star,
    examples: [
      { name: 'Market Price: $2.87', set: 'OP01-047', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454534_in_600x600.jpg' },
      { name: 'Market Price: $457.18', set: 'OP01-051', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454536_in_600x600.jpg' },
      { name: 'Market Price: $34.00', set: 'OP01-032', img: 'https://tcgplayer-cdn.tcgplayer.com/product/539492_in_600x600.jpg' }
    ]
  },
  {
    id: 'leader',
    code: 'L',
    name: 'Leader',
    description: 'The most crucial card in your deck! Your Leader determines your starting life total, your deck\'s color identity, and your overall playstyle. With unique abilities that can be activated once per turn, choosing the right Leader is the first step to becoming the Pirate King.',
    minPrice: 0.50,
    maxPrice: 10.00,
    tag: 'Commander',
    gradient: 'from-red-600 to-red-800',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: Users,
    examples: [
      { name: 'Market Price: $0.73', set: 'OP01-001', img: 'https://tcgplayer-cdn.tcgplayer.com/product/498253_in_600x600.jpg' },
      { name: 'Market Price: $324.60', set: 'OP01-060', img: 'https://tcgplayer-cdn.tcgplayer.com/product/498254_in_600x600.jpg' },
      { name: 'Market Price: $795.50', set: 'OP02-013', img: 'https://tcgplayer-cdn.tcgplayer.com/product/453506_in_600x600.jpg' }
    ]
  },
  {
    id: 'super-rare',
    code: 'SR',
    name: 'Super Rare',
    description: 'The heavy hitters of the card game. Super Rares boast intricate holofoil patterns and powerful, game-ending abilities. You will typically find 3 to 4 of these in a booster box. These are often the boss monsters or key combo pieces that decks are built around.',
    minPrice: 5.00,
    maxPrice: 30.00,
    tag: 'High Hit',
    gradient: 'from-purple-600 to-purple-800',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    icon: Sparkles,
    examples: [
      { name: 'Market Price: $1.16', set: 'OP01-078', img: 'https://tcgplayer-cdn.tcgplayer.com/product/514543_in_600x600.jpg' },
      { name: 'Market Price: $34.48', set: 'OP01-120', img: 'https://tcgplayer-cdn.tcgplayer.com/product/514544_in_600x600.jpg' },
      { name: 'Market Price: $691.15', set: 'OP01-121', img: 'https://tcgplayer-cdn.tcgplayer.com/product/516558_in_600x600.jpg' }
    ]
  },
  {
    id: 'secret-rare',
    code: 'SEC',
    name: 'Secret Rare',
    description: 'The elusive treasures of a set! Secret Rares feature textured foiling and gold accents that make the art pop. Extremely scarce, with only about 2 appearing in an entire case of booster boxes. Pulling one is a major event for any collector.',
    minPrice: 20.00,
    maxPrice: 150.00,
    tag: 'Elite Tier',
    gradient: 'from-orange-500 to-orange-700',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: Gem,
    examples: [
      { name: 'Market Price: $12.21', set: 'OP01-120', img: 'https://tcgplayer-cdn.tcgplayer.com/product/501997_in_600x600.jpg' },
      { name: 'Market Price: $21.47', set: 'OP02-121', img: 'https://tcgplayer-cdn.tcgplayer.com/product/500116_in_600x600.jpg' },
      { name: 'Market Price: $782.10', set: 'OP03-122', img: 'https://tcgplayer-cdn.tcgplayer.com/product/500118_in_600x600.jpg' }
    ]
  },
  {
    id: 'gold',
    code: 'Golden DON!!',
    name: 'Solid Gold',
    description: 'The ultimate collector\'s item. These are special versions of the DON!! resource cards, completely foiled in gold. They are incredibly rare and add a level of prestige to your board that is unmatched. The true One Piece for card collectors!',
    minPrice: 500.00,
    maxPrice: 2000.00,
    tag: 'Masterpiece',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    icon: Crown,
    examples: [
      { name: 'Market Price: $81.61', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/586884_in_600x600.jpg' },
      { name: 'Market Price: $144.99', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/586554_in_600x600.jpg' },
      { name: 'Market Price: $135.31', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/587706_in_600x600.jpg' }
    ]
  }
];

const PURCHASE_OPTIONS = [
  {
    name: 'Booster Box (OP-14)',
    price: 109.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Azure Sea'
  },
  {
    name: 'Booster Pack (OP-14)',
    price: 4.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Try Your Luck'
  },
  {
    name: 'Double Pack Set',
    price: 12.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Bonus Don!!'
  }
];

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

const formatCompactNumber = (num) => {
  if (!num || isNaN(num)) return '---';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

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
  const [videoLoading, setVideoLoading] = useState(true); 
  const [cardsLoading, setCardsLoading] = useState(true); 
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
    if (!searchQuery) return;
    const lowerQuery = searchQuery.toLowerCase();
    
    const matchedRarity = RARITIES.find(r => 
      r.name.toLowerCase().includes(lowerQuery) || 
      r.code.toLowerCase() === lowerQuery ||
      r.id.includes(lowerQuery)
    );

    if (matchedRarity) {
      const element = document.getElementById(matchedRarity.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCardsLoading(false);
    }, 1200); 
    return () => clearTimeout(timer);
  }, []);





  // Fallback Data - SPECIFIC to One Piece Masters Channel Context
  const FALLBACK_CHANNEL_DATA = {
    name: 'One Piece Masters',
    handle: '@OnepieceMasters',
    url: 'https://www.youtube.com/@OnepieceMasters',
    subscribers: 102000, // Estimated/Placeholder based on user request
    videos: 450,
    likes: 12500000,
    avatar: CHANNEL_LOGO_URL 
  };

  // Using generic high-quality thumbnails that match the channel's "Opening/Pull" theme
  const FALLBACK_VIDEOS = [
    {
      id: 'fb-1',
      title: 'OPENING THE NEW OP-10 GOD PACK?! 😱🔥',
      thumbnail: 'https://i.ytimg.com/vi/placeholder1/maxresdefault.jpg', // We'll use a better placeholder below
      imgUrl: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1600&auto=format&fit=crop', // Card spread
      timeAgo: '1 day ago',
      duration: 865 
    },
    {
      id: 'fb-2',
      title: 'Searching for MANGA LUFFY in OP-05! (My Wallet Cries)',
      imgUrl: 'https://images.unsplash.com/photo-1607604276583-eef5f076eb86?q=80&w=1600&auto=format&fit=crop', // Anime figure/cards
      timeAgo: '3 days ago',
      duration: 1420 
    },
    {
      id: 'fb-3',
      title: 'Top 10 MOST EXPENSIVE One Piece Cards Right Now �',
      imgUrl: 'https://images.unsplash.com/photo-1593305841991-05c2e449e08e?q=80&w=1600&auto=format&fit=crop', // Cards
      timeAgo: '1 week ago',
      duration: 1150 
    },
    {
      id: 'fb-4',
      title: 'Grading Returns! PSA 10 or Bust? 💎',
      imgUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1600&auto=format&fit=crop', // Slabs
      timeAgo: '2 weeks ago',
      duration: 980 
    }
  ];

  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        setLoading(true);
        // ... (API calls remain the same)
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&key=${API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (!searchData.items || searchData.items.length === 0) throw new Error('Channel not found.');
        const channelId = searchData.items[0].id.channelId;
  
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelDetails = await channelResponse.json();
        
        if (!channelDetails.items) throw new Error('Channel details failed');
        const channelItem = channelDetails.items[0];
        
        setChannelData({
          name: channelItem.snippet.title,
          handle: channelItem.snippet.customUrl || '@OnepieceMasters',
          url: `https://www.youtube.com/channel/${channelId}`,
          subscribers: parseInt(channelItem.statistics.subscriberCount),
          videos: parseInt(channelItem.statistics.videoCount),
          likes: parseInt(channelItem.statistics.viewCount),
          avatar: CHANNEL_LOGO_URL 
        });

        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        setVideoLoading(true);
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=30&key=${API_KEY}`;
        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (playlistData.items) {
           const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
           const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
           const durationResponse = await fetch(durationUrl);
           const durationData = await durationResponse.json();
           
           const durationMap = {};
           if (durationData.items) {
             durationData.items.forEach(v => {
                durationMap[v.id] = parseDuration(v.contentDetails.duration);
             });
           }

           const longFormVideos = playlistData.items.filter(item => {
              const duration = durationMap[item.contentDetails.videoId];
              return duration > 65; 
           }).slice(0, 6);

           const formattedVideos = longFormVideos.map(item => ({
             id: item.contentDetails.videoId,
             title: item.snippet.title,
             thumbnail: item.snippet.thumbnails.maxres ? item.snippet.thumbnails.maxres.url : (item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.medium.url),
             timeAgo: timeAgo(item.snippet.publishedAt),
             duration: durationMap[item.contentDetails.videoId] 
           }));
           
           setLatestVideos(formattedVideos);
        } else {
            throw new Error('Playlist items failed');
        }
        setVideoLoading(false);

      } catch (err) {
        console.warn("YouTube API Error (Using Fallback Data):", err);
        setChannelData(FALLBACK_CHANNEL_DATA);
        // Map fallback videos to the expected format
        setLatestVideos(FALLBACK_VIDEOS.map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.imgUrl,
            timeAgo: v.timeAgo,
            duration: v.duration
        })));
        setVideoLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchYouTubeData();
  }, []);

  const formatPrice = (val, isApprox = false) => {
    if (currency === 'INR') {
       return `₹${Math.round(val * USD_TO_INR).toLocaleString('en-IN')}${isApprox ? '*' : ''}`; 
    }
    return `$${val.toFixed(2)}${isApprox ? '*' : ''}`;
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
                placeholder="Search rarity (e.g. 'Common', 'Manga')..."
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
             <a href="https://www.instagram.com/masterztcgverse/" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
               <Instagram className="w-5 h-5" />
             </a>
             <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
           </div>
         </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden pt-20">
         <div className="absolute inset-0 z-0">
           <img src="https://images.alphacoders.com/133/1334415.png" alt="One Piece Hero" className="w-full h-full object-cover opacity-20 scale-110 animate-[zoom_20s_ease-in-out_infinite]" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/40" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
         </div>
         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  <Youtube className="w-4 h-4" /> Official Channel
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                  Discover <br /> Card <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Rarities</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-medium">
                  Join One Piece Masters ({channelData.handle}) as we open packs, hunt for Mangas, and build the ultimate decks!
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a href={channelData.url} target="_blank" rel="noopener noreferrer" className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-red-500/50 transition-all flex items-center gap-3 transform hover:scale-105">
                    <Youtube className="w-5 h-5" /> Subscribe Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                   <div className="text-left">
                     <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formatCompactNumber(channelData.subscribers)}</div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Subscribers</div>
                   </div>
                   <div className="text-left">
                     <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formatCompactNumber(channelData.videos)}</div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Videos</div>
                   </div>
                   <div className="text-left">
                     <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formatCompactNumber(channelData.likes)}</div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Views</div>
                   </div>
                </div>
              </div>

              {/* Right Image - Desktop Only */}
              <div className="hidden lg:block relative h-full min-h-[500px] w-full">
                 <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-950/20 z-10"></div>
                 
                 {/* Image Container with Loading State */}
                 <div className={`transition-opacity duration-1000 ease-in-out ${loading ? 'opacity-0' : 'opacity-100'}`}>
                   <img 
                     src={heroImage} 
                     alt="Luffy Joyboy" 
                     className="w-full h-full object-contain drop-shadow-2xl mask-image-gradient"
                     style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                     onLoad={() => setLoading(false)}
                   />
                 </div>

                 {/* Glow Effect */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/20 blur-[100px] rounded-full -z-10"></div>
              </div>
            </div>
         </div>
      </header>

      {/* Latest Uploads Section */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
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
                  {/* <span className="text-amber-500 font-bold ml-1">Full content only, no shorts.</span> */}
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
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {latestVideos.map((video) => (
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
                        <span className="text-[10px] font-bold text-white tracking-wider">VIDEO</span>
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
                ))}
                
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

      {/* Rarity Section Intro */}
      <section className="relative py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-white/5 my-24 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Crown className="w-4 h-4" /> Ultimate Guide
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
              One Piece <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Card Types</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-light">
              Understanding the rarity system is crucial for every collector and player. 
              From the humble Commons to the prestigious Manga Rares, each card type serves a unique purpose. 
              Explore the hierarchy below to learn what to look for!
            </p>
         </div>
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-gradient-to-r from-amber-500/20 to-transparent rounded-full blur-[150px]"></div>
         </div>
      </section>

      {/* Rarity List with User Requested Format (No character names) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-16">
        {cardsLoading ? (
           <div className="space-y-16 animate-pulse">
             {[1,2,3].map(i => (
                <div key={i} className="flex flex-col lg:flex-row gap-12 opacity-50">
                   <div className="w-20 h-20 bg-slate-800 rounded-3xl"></div>
                   <div className="flex-1 space-y-4">
                      <div className="h-10 bg-slate-800 rounded-xl w-1/3"></div>
                      <div className="h-32 bg-slate-800 rounded-xl w-full"></div>
                   </div>
                </div>
             ))}
           </div>
        ) : (
          RARITIES.map((rarity, index) => {
             const IconComponent = rarity.icon;
             return (
               <section 
                 id={rarity.id} 
                 key={rarity.id} 
                 className="scroll-mt-32 border-b border-white/5 pb-16 last:border-0 last:pb-0 animate-[fadeIn_0.8s_ease-out_forwards]"
                 style={{ animationDelay: `${index * 100}ms` }}
               >
                 <div className="flex flex-col gap-12">
                   <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                     <div className="flex items-start gap-5 lg:w-auto">
                       <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${rarity.gradient} flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform flex-shrink-0`}>
                         <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
                         <IconComponent className="relative z-10 w-10 h-10 text-white" strokeWidth={2} />
                       </div>
                       <div className="flex-1">
                         <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${rarity.textColor} bg-white/5 rounded-full mb-2`}>{rarity.tag}</span>
                         <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{rarity.name}</h2>
                         <div className="flex items-center gap-2 mt-2">
                           <div className={`w-auto px-3 h-8 rounded-lg bg-gradient-to-br ${rarity.gradient} flex items-center justify-center shadow-lg`}>
                             <span className="text-xs font-black text-white whitespace-nowrap">{rarity.code}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className={`lg:flex-1 relative overflow-hidden bg-gradient-to-br from-slate-800/30 to-slate-900/30 border ${rarity.borderColor} rounded-2xl backdrop-blur-sm`}>
                       <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${rarity.gradient} opacity-5 blur-3xl`}></div>
                       <div className="relative z-10 p-6">
                         <div className="flex items-center justify-between mb-4">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Collector's Value</span>
                           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase">Hobby</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="flex-1">
                             <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">From</span>
                             <span className="text-2xl font-black text-white">{formatPrice(rarity.minPrice)}</span>
                           </div>
                           <div className="w-12 h-[2px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full"></div>
                           <div className="flex-1 text-right">
                             <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">To</span>
                             <span className="text-2xl font-black text-white">{formatPrice(rarity.maxPrice)}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   <p className="text-base text-slate-400 leading-relaxed max-w-4xl">{rarity.description}</p>
                   {/* EXAMPLE CARDS GRID - UPDATED FOR USER REQUEST */}
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
                     {rarity.examples.map((card, idx) => (
                       <div key={idx} className="group space-y-4 w-full max-w-[200px]">
                         <div className={`relative aspect-[2/2.8] rounded-2xl bg-slate-800 border ${rarity.borderColor} overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02]`}>
                           <img src={card.img} alt={card.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x560/1e293b/white?text=Add+Image"; }} />
                         </div>
                         <div className="px-1 space-y-1 text-center">
                           {/* User requested: No name, just the price strings provided */}
                           <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">{card.name}</h4>
                           <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-mono tracking-wider">{card.set}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </section>
             );
          })
        )}
      </main>

      {/* Market Intelligence (Updated with OP-14 Azure Sea's Seven) */}
      <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/10 to-orange-600/10 blur-[120px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30"><Bell className="text-white w-6 h-6" /></div>
              <div><h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Latest News</h3><p className="text-sm text-slate-500 font-semibold uppercase tracking-widest mt-1">Stay Updated</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NewsItem category="Released" title="OP-14: The Azure Sea's Seven is HERE" date="JAN 2026" gradient="from-purple-600 to-pink-600" link="https://en.onepiece-cardgame.com"/>
            <NewsItem category="Market Watch" title="Manga Rare prices stabilize post OP-14" date="FEB 2026" gradient="from-amber-500 to-orange-600" link="https://www.tcgplayer.com"/>
            <NewsItem category="Meta" title="New Leader builds dominating 2026 Regionals" date="FEB 2026" gradient="from-blue-600 to-cyan-600" link="https://onepiece.limitlesstcg.com"/>
          </div>
        </div>
      </section>

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
                  <div className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formatPrice(option.price)}</div>
                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold uppercase rounded-xl shadow-lg hover:shadow-2xl transition-all group-hover:scale-105">Purchase Now</button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

       {/* Footer */}
      <footer className="relative py-12 border-t border-white/10 text-center flex flex-col items-center gap-4">
        <a href="https://www.instagram.com/masterztcgverse/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-pink-500 transition-colors">
            <Instagram className="w-5 h-5" />
            <span className="font-bold text-sm">@masterztcgverse</span>
        </a>
        <p className="text-slate-600 text-sm">© 2026 OP Masters. Unofficial Fan Site. <br/>One Piece is a trademark of Eiichiro Oda / Shueisha / Toei Animation.</p>
      </footer>
      <style>{`
        @keyframes zoom { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1.15); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {/* Mobile Bottom Navigation (App-like feel) */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center justify-center w-full h-full text-amber-500">
            <TrendingUp className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>
          <button onClick={() => document.getElementById('latest-uploads')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
            <Play className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Videos</span>
          </button>
          <button onClick={() => document.getElementById('common')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
            <Crown className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Rarities</span>
          </button>
          <a href={channelData.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Channel</span>
          </a>
        </div>
      </div>
      
      {/* Safe Area Spacer for Mobile Nav */}
      <div className="h-20 md:hidden"></div>

    </div>
  );
};

export default App;