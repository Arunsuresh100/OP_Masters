import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LatestVideos from './components/LatestVideos';
import AboutCards from './components/AboutCards';
import CardTypes from './components/CardTypes';
import LatestNews from './components/LatestNews';
import Shop from './components/Shop';
import Footer from './components/Footer';
import { API_KEY, CHANNEL_HANDLE, CHANNEL_ID, CHANNEL_LOGO_URL, FALLBACK_CHANNEL_DATA, FALLBACK_VIDEOS, RARITIES } from './constants';
import { parseDuration, timeAgo, formatCompactNumber } from './utils';

const App = () => {
  const [currency, setCurrency] = useState('USD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelData, setChannelData] = useState({
    name: 'One Piece Masters',
    handle: '@OnepieceMasters',
    url: `https://www.youtube.com/@OnepieceMasters`,
    subscribers: '---',
    videos: '---',
    views: '---',
    avatar: CHANNEL_LOGO_URL 
  });
  const [latestVideos, setLatestVideos] = useState([]);

  // Sequence: Fetch Data -> Wait min time -> Fade In App
  useEffect(() => {
    const fetchYouTubeData = async () => {
      const startTime = Date.now();
      try {
        // Fetch logic...
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelDetails = await channelResponse.json();
        
        if (!channelDetails.error && channelDetails.items) {
          const channelItem = channelDetails.items[0];
          setChannelData({
            name: channelItem.snippet.title,
            handle: channelItem.snippet.customUrl || CHANNEL_HANDLE,
            url: `https://www.youtube.com/channel/${CHANNEL_ID}`,
            subscribers: formatCompactNumber(channelItem.statistics.subscriberCount),
            videos: formatCompactNumber(channelItem.statistics.videoCount),
            views: formatCompactNumber(channelItem.statistics.viewCount),
            avatar: channelItem.snippet.thumbnails.medium.url 
          });

          const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;
          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15&key=${API_KEY}`;
          const playlistResponse = await fetch(playlistUrl);
          const playlistData = await playlistResponse.json();

          if (playlistData.items) {
             const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
             // Fetch durations & views to filter out Shorts and show stats
             const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
             const statsResponse = await fetch(statsUrl);
             const statsData = await statsResponse.json();
             
             const videoStatsMap = {};
             statsData.items?.forEach(v => {
                  videoStatsMap[v.id] = {
                    duration: parseDuration(v.contentDetails.duration),
                    views: formatCompactNumber(v.statistics.viewCount)
                  };
             });

             const longFormVideos = playlistData.items.filter(item => {
                const stats = videoStatsMap[item.contentDetails.videoId];
                return stats?.duration > 60; 
             }).slice(0, 6).map(item => ({
               id: item.contentDetails.videoId,
               title: item.snippet.title,
               thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
               timeAgo: timeAgo(item.snippet.publishedAt),
               duration: videoStatsMap[item.contentDetails.videoId]?.duration,
               views: videoStatsMap[item.contentDetails.videoId]?.views
             }));
             setLatestVideos(longFormVideos);
          }
        } else {
          throw new Error("Invalid API Response");
        }
      } catch (err) {
        console.warn("YouTube Fetch Fallback Applied");
        setChannelData({
            ...FALLBACK_CHANNEL_DATA,
            subscribers: formatCompactNumber(FALLBACK_CHANNEL_DATA.subscribers),
            videos: formatCompactNumber(FALLBACK_CHANNEL_DATA.videos),
            views: formatCompactNumber(FALLBACK_CHANNEL_DATA.views)
        });
        setLatestVideos(FALLBACK_VIDEOS);
      } finally {
        // Minimum Loading Time: 1.5s for brand impact
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        
        setTimeout(() => {
          setLoading(false);
          // Small delay for the fade-out of splash before app is fully ready
          setTimeout(() => setAppReady(true), 100);
        }, remainingTime);
      }
    };

    fetchYouTubeData();
  }, []);

  // Search Logic
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-amber-500/30">
      {/* Cinematic Splash Screen */}
      <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${!loading ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'}`}>
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={CHANNEL_LOGO_URL} alt="Loading" className="w-14 h-14 md:w-20 md:h-20 rounded-full animate-pulse shadow-2xl" />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <span className="text-[10px] md:text-xs font-black text-white tracking-[0.5em] uppercase opacity-50">Entering the Grand Line</span>
          <div className="h-[2px] w-40 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-1000 ${loading ? 'w-1/2 animate-[loading-bar_3s_infinite]' : 'w-full'}`}></div>
          </div>
        </div>
      </div>

      {/* Main Content with Fade-In */}
      <div className={`transition-all duration-1000 ease-out ${appReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
        <LatestNews />
        <Shop currency={currency} />
        <Footer channelUrl={channelData.url} />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes zoom { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1.15); } }
      `}</style>
    </div>
  );
};

export default App;