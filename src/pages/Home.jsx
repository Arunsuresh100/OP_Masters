import React from 'react';
import Hero from '../components/Hero';
import LatestVideos from '../components/LatestVideos';
import AboutCards from '../components/AboutCards';
import CardTypes from '../components/CardTypes';
import LatestNews from '../components/LatestNews';

const Home = ({ channelData, latestVideos, loading, appReady, searchQuery, currency }) => {
  return (
    <div className={`transition-all duration-1000 ease-out ${appReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <Hero channelData={channelData} />
      <LatestVideos videos={latestVideos} loading={loading} />
      <AboutCards id="about" />
      <LatestNews />
    </div>
  );
};

export default Home;
