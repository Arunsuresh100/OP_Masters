import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_FILE = path.join(__dirname, 'cards.json');
// We want to fetch cards from these sets
const TARGET_SETS = ['OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12', 'OP13']; // Expanded for new sets

// Official Rarity Mapping based on what we see in the JSON vs what UI expects
const RARITY_MAP = {
    'Common': 'C',
    'Uncommon': 'UC',
    'Rare': 'R',
    'SuperRare': 'SR',
    'Leader': 'L',
    'SecretRare': 'SEC',
    'SpecialRare': 'SP',
    'Special': 'SP',
    'TreasureRare': 'TR',
    'Manga': 'Manga' // Just in case
};

const fetchCards = async () => {
    try {
        console.log('Fetching index...');
        const indexRes = await axios.get('https://raw.githubusercontent.com/buhbbl/punk-records/main/english/index/cards_by_id.json');
        const indexData = indexRes.data; // { "OP01-001": { name, pack_id }, ... }

        console.log(`Found ${Object.keys(indexData).length} card versions in index.`);

        const cardsToFetch = [];
        
        // Loop through all keys in index to find targets
        for (const [fullId, meta] of Object.entries(indexData)) {
            // fullId examples: "OP01-001", "OP01-001_p1"
            
            // Extract Set ID (first 4 chars usually)
            const setIdMatch = fullId.match(/^(OP\d{2})/);
            if (!setIdMatch) continue;
            
            const setId = setIdMatch[1];
            
            // Check if this card belongs to one of our target sets
            if (TARGET_SETS.includes(setId)) {
                // Heuristic for Manga/Parallel:
                // If it has _p* in the ID, it's a parallel.
                const isParallel = fullId.includes('_p');

                cardsToFetch.push({
                    id: fullId,
                    setId: setId,
                    packId: meta.pack_id,
                    isParallel: isParallel
                });
            }
        }

        console.log(`Filtered ${cardsToFetch.length} cards for target sets.`);
        
        // Increase limit to cover more interesting cards, or fetch all if possible
        // Let's try 2000 to get a good spread including some high rarities
        const limitedCards = cardsToFetch.slice(0, 2000); 

        console.log(`Fetching details for ${limitedCards.length} cards...`);

        const cardDetails = [];
        let successCount = 0;

        const BATCH_SIZE = 20;
        for (let i = 0; i < limitedCards.length; i += BATCH_SIZE) {
            const batch = limitedCards.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (item) => {
                try {
                    const url = `https://raw.githubusercontent.com/buhbbl/punk-records/main/english/cards/${item.packId}/${item.id}.json`;
                    // console.log(`Fetching ${item.id}...`); 
                    const res = await axios.get(url);
                    const data = res.data;

                    // Determine Rarity Code
                    let code = RARITY_MAP[data.rarity] || data.rarity;
                    
                    // MANGA / PARALLEL LOGIC
                    if (code === 'SEC' && item.isParallel) {
                         code = 'Manga'; 
                    }
                    
                    if (code === 'SP' || code === 'TR') {
                        // Keep as is
                    }

                    // Map to our schema
                    const card = {
                        id: data.id,
                        name: data.name,
                        rarity: code,
                        set: item.setId, 
                        image: data.img_full_url || data.img_url,
                        price: 0, // calculated below
                        character: data.name, 
                        description: data.effect,
                        colors: data.colors || [],
                        cost: data.cost,
                        type: data.category
                    };

                    // Simulated Price Logic based on Rarity
                    let basePrice = 0;
                    if (code === 'C') basePrice = Math.random() * 0.5 + 0.1;
                    else if (code === 'UC') basePrice = Math.random() * 2 + 0.5;
                    else if (code === 'R') basePrice = Math.random() * 5 + 1;
                    else if (code === 'SR') basePrice = Math.random() * 15 + 5;
                    else if (code === 'L') basePrice = Math.random() * 30 + 10;
                    else if (code === 'SEC') basePrice = Math.random() * 80 + 40;
                    else if (code === 'SP') basePrice = Math.random() * 120 + 60;
                    else if (code === 'TR') basePrice = Math.random() * 150 + 80;
                    else if (code === 'Manga') basePrice = Math.random() * 1500 + 800; // Manga is huge
                    else basePrice = Math.random() * 5;

                    card.price = parseFloat(basePrice.toFixed(2));

                    // Simulated Market Data
                    const change = (Math.random() * 30) - 15; // -15% to +15%
                    card.percentChange = parseFloat(change.toFixed(2));
                    card.marketTrend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
                    card.volume = Math.floor(Math.random() * 500) + 10; // 10 to 510 daily trades
                    
                    // Last Sold Price (slightly different from current price)
                    const lastSoldVariance = (Math.random() * 0.2) - 0.1; // +/- 10%
                    card.lastSoldPrice = parseFloat((card.price * (1 + lastSoldVariance)).toFixed(2));

                    cardDetails.push(card);
                    successCount++;

                } catch (err) {
                    // console.error(`Error fetching ${item.id}: ${err.message}`);
                }
            }));
            
            console.log(`Processed ${Math.min(i + BATCH_SIZE, limitedCards.length)} cards...`);
            // Small delay to be nice
            await new Promise(r => setTimeout(r, 100));
        }

        const jsonContent = JSON.stringify({ cards: cardDetails }, null, 2);
        fs.writeFileSync(CARDS_FILE, jsonContent);
        console.log(`Successfully saved ${cardDetails.length} cards to ${CARDS_FILE}`);

    } catch (error) {
        console.error('Script failed:', error);
    }
};

fetchCards();
