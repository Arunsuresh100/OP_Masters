import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LatestVideos from './components/LatestVideos';
import AboutCards from './components/AboutCards';
import CardTypes from './components/CardTypes';
// import LatestNews from './components/LatestNews';
// import Shop from './components/Shop';
import Footer from './components/Footer';
import { API_KEY, CHANNEL_HANDLE, CHANNEL_ID, CHANNEL_LOGO_URL, FALLBACK_CHANNEL_DATA, FALLBACK_VIDEOS, RARITIES } from './constants';
import { parseDuration, timeAgo, formatCompactNumber } from './utils';

const App = () => {
  const [currency, setCurrency] = useState('USD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelData, setChannelData] = useState({
    name: 'One Piece Masters',
    handle: '@OnepieceMasters',
    url: `https://www.youtube.com/@OnepieceMasters`,
    subscribers: '---',
    videos: '---',
    likes: '---',
    avatar: CHANNEL_LOGO_URL 
  });
  const [latestVideos, setLatestVideos] = useState([]);

  // Search Logic: Scroll to section
  useEffect(() => {
    if (!searchQuery) return;
    const query = searchQuery.toLowerCase();
    
    if (query.includes('about')) {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const matchedRarity = RARITIES.find(r => 
        r.name.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)
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
        
        // Use CHANNEL_ID directly to save quota and avoid 403 errors
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelDetails = await channelResponse.json();
        
        if (channelDetails.error) {
           throw new Error(channelDetails.error.message);
        }

        const channelItem = channelDetails.items[0];
        
        setChannelData({
          name: channelItem.snippet.title,
          handle: channelItem.snippet.customUrl || CHANNEL_HANDLE,
          url: `https://www.youtube.com/channel/${CHANNEL_ID}`,
          subscribers: formatCompactNumber(channelItem.statistics.subscriberCount),
          videos: formatCompactNumber(channelItem.statistics.videoCount),
          likes: formatCompactNumber(channelItem.statistics.viewCount),
          avatar: channelItem.snippet.thumbnails.medium.url 
        });

        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        // Fetch Playlist Items (Videos)
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15&key=${API_KEY}`;
        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (playlistData.items) {
           const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
           
           // Fetch durations to filter out Shorts
           const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
           const durationResponse = await fetch(durationUrl);
           const durationData = await durationResponse.json();
           
           const durationMap = {};
           durationData.items?.forEach(v => {
                durationMap[v.id] = parseDuration(v.contentDetails.duration);
           });

           // Filter for long-form content (> 60s)
           const longFormVideos = playlistData.items.filter(item => {
              const duration = durationMap[item.contentDetails.videoId];
              return duration > 60; 
           }).slice(0, 6);

           setLatestVideos(longFormVideos.map(item => ({
             id: item.contentDetails.videoId,
             title: item.snippet.title,
             thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
             timeAgo: timeAgo(item.snippet.publishedAt),
             duration: durationMap[item.contentDetails.videoId] 
           })));
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
        currency={currency} setCurrency={setCurrency} 
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        channelUrl={channelData.url}
      />
      
      <Hero channelData={channelData} />
      
      <LatestVideos videos={latestVideos} loading={loading} />
      
      <AboutCards id="about" />
      
      <CardTypes searchQuery={searchQuery} currency={currency} />
      
      {/* <LatestNews /> */}
      
      {/* <Shop currency={currency} /> */}
      
      <Footer channelUrl={channelData.url} />

      <style>{`@keyframes zoom { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1.15); } }`}</style>
    </div>
  );
};

export default App;