
const API_KEY = 'AIzaSyB3JbL6gT9m-IadtGVDJc1qwYb-68JYk38';
const CHANNEL_HANDLE = 'OnepieceMasters';

async function testFetch() {
    console.log(`Testing fetch for handle: ${CHANNEL_HANDLE}`);
    
    try {
        // 1. Search for Channel ID
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(CHANNEL_HANDLE)}&type=channel&key=${API_KEY}`;
        console.log(`Fetching Search URL: ${searchUrl}`);
        
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.error) {
            console.error("Search API Error:", JSON.stringify(searchData.error, null, 2));
            return;
        }

        if (!searchData.items || searchData.items.length === 0) {
            console.error("Channel not found in search.");
            return;
        }

        const channelId = searchData.items[0].id.channelId;
        console.log(`Found Channel ID: ${channelId}`);

        // 2. Fetch Channel Stats
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${API_KEY}`;
        console.log(`Fetching Channel Details...`);
        
        const channelRes = await fetch(channelUrl);
        const channelData = await channelRes.json();

        if (channelData.error) {
            console.error("Channel API Error:", JSON.stringify(channelData.error, null, 2));
            return;
        }

        const stats = channelData.items[0].statistics;
        console.log("Channel Stats:", stats);
        
        // 3. Fetch Videos (Uploads)
        const uploadsId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        console.log(`Uploads Playlist ID: ${uploadsId}`);
        
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=5&key=${API_KEY}`;
        const playlistRes = await fetch(playlistUrl);
        const playlistData = await playlistRes.json();
        
        if (playlistData.error) {
             console.error("Playlist API Error:", JSON.stringify(playlistData.error, null, 2));
             return;
        }

        console.log(`Found ${playlistData.items.length} videos.`);
        playlistData.items.forEach((item, i) => {
            console.log(`[${i}] ${item.snippet.title} (ID: ${item.contentDetails.videoId})`);
        });

    } catch (error) {
        console.error("Unexpected Error:", error);
    }
}

testFetch();
