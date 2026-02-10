import { API_KEY, CHANNEL_ID } from './constants';

// Target the hidden "Uploads" playlist for 100% accuracy
const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, 'UU');

export const fetchYouTubeVideos = async (limit = 6) => {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${limit}&playlistId=${UPLOADS_PLAYLIST_ID}&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items) return [];
    return data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      timeAgo: timeAgo(item.snippet.publishedAt),
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error("YouTube Fetch Error:", error);
    return [];
  }
};

export const parseDuration = (isoDuration) => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  return (hours * 3600) + (minutes * 60) + seconds;
};

export const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
};

export const formatPrice = (val, currency, rate) => {
  if (currency === 'INR') {
    return `₹${(val * rate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `$${val.toFixed(2)}`;
};

export const formatCompactNumber = (number) => {
  const num = Number(number);
  if (isNaN(num) || (!num && num !== 0)) return '---';
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};