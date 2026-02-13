import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Cards from './pages/Cards';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AuthModals from './components/AuthModals';
import { useUser } from './context/UserContext';
import { CHANNEL_HANDLE, CHANNEL_ID, CHANNEL_LOGO_URL, FALLBACK_CHANNEL_DATA, FALLBACK_VIDEOS } from './constants';
import { parseDuration, timeAgo, formatDuration, formatCompactNumber } from './utils';

// Using a public path for the logo to prevent build crashes if the file is missing
const LOGO_PATH = '/logo.png'; 
const APP_LOGO = LOGO_PATH; // Fallback to CHANNEL_LOGO_URL if you prefer: LOGO_PATH || CHANNEL_LOGO_URL

const App = () => {
  // Deployment Sync: v1.1.0 - Integrated Marketplace and One Piece Master branding
  const [currency, setCurrency] = useState('INR');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelData, setChannelData] = useState({
    name: 'OP MASTER',
    handle: '@OnepieceMasters',
    url: `https://www.youtube.com/@OnepieceMasters`,
    subscribers: '---',
    videos: '---',
    views: '---',
    avatar: CHANNEL_LOGO_URL 
  });
  const [latestVideos, setLatestVideos] = useState([]);
  const { authModal, closeAuth } = useUser();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchYouTubeData = async () => {
      const startTime = Date.now();
      try {
        const backendUrl = 'http://localhost:3001/api/youtube';
        
        // 1. Fetch channel info from proxy
        const channelResponse = await fetch(`${backendUrl}/channel`);
        const channelDetails = await channelResponse.json();
        
        if (channelDetails.error || !channelDetails.items?.length) {
           throw new Error("Proxy error or Channel not found");
        }

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
        
        // 2. Fetch videos from proxy
        const playlistResponse = await fetch(`${backendUrl}/videos?playlistId=${uploadsPlaylistId}`);
        const playlistData = await playlistResponse.json();

        if (playlistData.items?.length) {
           const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
           
           // 3. Fetch video stats from proxy
           const statsResponse = await fetch(`${backendUrl}/stats?ids=${videoIds}`);
           const statsData = await statsResponse.json();
           
           const videoStatsMap = {};
           statsData.items?.forEach(v => {
                videoStatsMap[v.id] = {
                  duration: parseDuration(v.contentDetails.duration),
                  views: formatCompactNumber(v.statistics.viewCount)
                };
           });

           const processedVideos = playlistData.items.map(item => {
              const stats = videoStatsMap[item.contentDetails.videoId];
              return {
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                timeAgo: timeAgo(item.snippet.publishedAt),
                duration: stats?.duration ? formatDuration(stats.duration) : '10:00',
                views: stats?.views || '1K+'
              };
           });

           if (processedVideos.length > 0) {
              setLatestVideos(processedVideos.slice(0, 6));
           } else {
              setLatestVideos(FALLBACK_VIDEOS);
           }
        } else {
           setLatestVideos(FALLBACK_VIDEOS);
        }

      } catch (err) {
        console.error('Fetch error:', err);
        setChannelData({
            name: FALLBACK_CHANNEL_DATA.name,
            handle: FALLBACK_CHANNEL_DATA.handle,
            url: FALLBACK_CHANNEL_DATA.url,
            subscribers: formatCompactNumber(FALLBACK_CHANNEL_DATA.subscribers),
            videos: formatCompactNumber(FALLBACK_CHANNEL_DATA.videos),
            views: formatCompactNumber(FALLBACK_CHANNEL_DATA.views),
            avatar: FALLBACK_CHANNEL_DATA.avatar
        });
        setLatestVideos(FALLBACK_VIDEOS);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setAppReady(true), 100);
        }, remainingTime);
      }
    };

    fetchYouTubeData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-amber-500/30">
      
      <AuthModals 
        isOpen={authModal.isOpen} 
        onClose={closeAuth} 
        initialMode={authModal.mode} 
      />
      {/* Cinematic Splash Screen */}
      <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${!loading ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'}`}>
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={APP_LOGO} alt="Loading" className="w-14 h-14 md:w-20 md:h-20 rounded-full animate-pulse shadow-2xl" 
                 onError={(e) => e.target.src = CHANNEL_LOGO_URL} />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <span className="text-[10px] md:text-xs font-black text-white tracking-[0.5em] uppercase opacity-50">Entering the Grand Line</span>
          <div className="h-[2px] w-40 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-1000 ${loading ? 'w-1/2 animate-[loading-bar_3s_infinite]' : 'w-full'}`}></div>
          </div>
        </div>
      </div>

      {!isAdminRoute && (
        <Navbar 
          currency={currency} setCurrency={setCurrency} 
          mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          channelUrl={channelData.url}
        />
      )}
      
      <div className={isAdminRoute ? "" : "pb-16 md:pb-0"}>
        <Routes>
        <Route path="/" element={
          <Home 
            channelData={channelData} 
            latestVideos={latestVideos} 
            loading={loading} 
            appReady={appReady} 
            searchQuery={searchQuery} 
            currency={currency} 
          />
        } />
        <Route path="/cards" element={
          <Cards currency={currency} />
        } />
        <Route path="/marketplace" element={
          <Marketplace currency={currency} />
        } />
        <Route path="/profile" element={
          <Profile />
        } />
        <Route path="/admin" element={
          <Admin />
        } />
      </Routes>
      </div>

      {!isAdminRoute && <Footer channelUrl={channelData.url} />}
      {!isAdminRoute && <MobileBottomNav />}

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
