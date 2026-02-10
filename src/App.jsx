import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
// import LatestVideos from './components/LatestVideos';
import AboutCards from './components/AboutCards';
import CardTypes from './components/CardTypes';
// import LatestNews from './components/LatestNews';
// import Shop from './components/Shop';
// import Footer from './components/Footer';
import { API_KEY, CHANNEL_HANDLE, CHANNEL_LOGO_URL, FALLBACK_CHANNEL_DATA, FALLBACK_VIDEOS, RARITIES } from './constants';
import { parseDuration, timeAgo, formatCompactNumber } from './utils';

const App = () => {
  const [currency, setCurrency] = useState('USD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // videoLoading is used for the specific section, but main loading covers initial fetch.
  // Actually, original code had two loaders. Let's keep it simple.
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

  // Search Logic: Scroll to section if query matches
  useEffect(() => {
    if (!searchQuery) return;
    const query = searchQuery.toLowerCase();
    
    // 1. "About" -> Scroll to AboutCards section
    if (query.includes('about')) {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } 
    // 2. Rarity Name (e.g., "common", "manga") -> Scroll to Rarity Section
    else {
      const matchedRarity = RARITIES.find(r => 
        r.name.toLowerCase().includes(query) || 
        r.id.toLowerCase().includes(query)
      );
      if (matchedRarity) {
        document.getElementById(matchedRarity.id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchQuery]);

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
        
        if (channelDetails.error) {
           throw new Error("Quota Exceeded or API Error");
        }

        const channelItem = channelDetails.items[0];
        
        setChannelData({
          name: channelItem.snippet.title,
          handle: channelItem.snippet.customUrl || '@OnepieceMasters',
          url: `https://www.youtube.com/channel/${channelId}`,
          subscribers: formatCompactNumber(channelItem.statistics.subscriberCount),
          videos: formatCompactNumber(channelItem.statistics.videoCount),
          likes: formatCompactNumber(channelItem.statistics.viewCount),
          avatar: CHANNEL_LOGO_URL 
        });

        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        // 3. Videos (Robust Fetch for Length)
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
           if (durationData.items) {
                durationData.items.forEach(v => {
                    durationMap[v.id] = parseDuration(v.contentDetails.duration);
                });
           }

           // Filter: Must be > 60 seconds (Shorts limit is usually 60s)
           const longFormVideos = playlistData.items.filter(item => {
              // YouTube shorts can be up to 60s, playing it safe with 65s filter
              const duration = durationMap[item.contentDetails.videoId];
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

      } catch (err) {
        console.warn("YouTube Fetch Error (Using Fallback):", err);
        setChannelData({
            ...FALLBACK_CHANNEL_DATA,
            subscribers: formatCompactNumber(FALLBACK_CHANNEL_DATA.subscribers),
            videos: formatCompactNumber(FALLBACK_CHANNEL_DATA.videos),
            likes: formatCompactNumber(FALLBACK_CHANNEL_DATA.likes)
        });
        setLatestVideos(FALLBACK_VIDEOS);
        setLoading(false);
      }
    };
    fetchYouTubeData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-amber-500/30">
      <Navbar 
        currency={currency} 
        setCurrency={setCurrency} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        channelUrl={channelData.url}
      />
      
      <Hero channelData={channelData} />
      
      {/* <LatestVideos videos={latestVideos} loading={loading} /> */}
      
      <AboutCards />
      
      <CardTypes searchQuery={searchQuery} currency={currency} />
      
      {/* <LatestNews /> */}
      
      {/* <Shop currency={currency} /> */}
      
      {/* <Footer channelUrl={channelData.url} /> */}

      <style>{`@keyframes zoom { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
};

export default App;