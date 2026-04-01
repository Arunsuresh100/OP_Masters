import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_FILE = path.join(__dirname, 'cards.json');
// We want to fetch cards from these sets
// Comprehensive list of target prefixes/sets based on client's exhaustive list
const TARGET_PREFIXES = [
    'OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'OP10', 'OP11', 'OP12', 'OP13', 'OP14', 'OP15',
    'EB01', 'EB02', 'EB03', 'EB04',
    'ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06', 'ST07', 'ST08', 'ST09', 'ST10', 'ST11', 'ST12', 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18', 'ST19', 'ST20', 'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29',
    'PRB01', 'PRB02', 'P-', 'OP-0'
];

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
    'Manga': 'Manga'
};

const fetchCards = async () => {
    try {
        console.log('Fetching index for all sets...');
        const indexRes = await axios.get('https://raw.githubusercontent.com/Buhbbl/punk-records/main/english/index/cards_by_id.json');
        const indexData = indexRes.data;

        console.log(`Found ${Object.keys(indexData).length} total card versions.`);

        const cardsToFetch = [];
        for (const [fullId, meta] of Object.entries(indexData)) {
            // Check if ID matches any of our target prefixes
            const matchesPrefix = TARGET_PREFIXES.some(prefix => fullId.startsWith(prefix));
            
            if (matchesPrefix) {
                const isParallel = fullId.includes('_p');
                cardsToFetch.push({
                    id: fullId,
                    setId: fullId.split('-')[0], // Extract set name
                    packId: meta.pack_id,
                    isParallel: isParallel
                });
            }
        }

        console.log(`Filtered ${cardsToFetch.length} cards across all requested sets.`);
        
        // Use a smaller slice if still hitting memory limits, but 5000 should be okay with optimization
        const limitedCards = cardsToFetch.slice(0, 5000); 

        console.log(`Fetching details for ${limitedCards.length} cards...`);
        const cardDetails = [];
        const BATCH_SIZE = 15; // Smaller batch to be safer

        for (let i = 0; i < limitedCards.length; i += BATCH_SIZE) {
            const batch = limitedCards.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (item) => {
                try {
                    const url = `https://raw.githubusercontent.com/Buhbbl/punk-records/main/english/cards/${item.packId}/${item.id}.json`;
                    const res = await axios.get(url);
                    const data = res.data;

                    let code = RARITY_MAP[data.rarity] || data.rarity;
                    if (code === 'SEC' && item.isParallel) {
                         code = 'Manga'; 
                    }

                    // Image Version Fix: official site uses ?260330 currently
                    let imgUrl = data.img_full_url || data.img_url;
                    if (imgUrl && imgUrl.includes('en.onepiece-cardgame.com')) {
                        imgUrl = imgUrl.split('?')[0] + '?260330';
                    }

                    // PRICING LOGIC
                    let jpBase = 0;
                    if (code === 'C') jpBase = Math.random() * 0.3 + 0.05;
                    else if (code === 'UC') jpBase = Math.random() * 1.5 + 0.3;
                    else if (code === 'R') jpBase = Math.random() * 4 + 0.8;
                    else if (code === 'SR') jpBase = Math.random() * 10 + 3;
                    else if (code === 'L') jpBase = Math.random() * 20 + 8;
                    else if (code === 'SEC') jpBase = Math.random() * 60 + 30;
                    else if (code === 'SP') jpBase = Math.random() * 90 + 50;
                    else if (code === 'TR') jpBase = Math.random() * 120 + 70;
                    else if (code === 'Manga') jpBase = Math.random() * 1200 + 700;
                    else jpBase = Math.random() * 4;

                    const priceJapanese = parseFloat(jpBase.toFixed(2));
                    const enPremium = code === 'Manga' || code === 'SEC' || code === 'SP' ? 3.5 : 2.5; 
                    const priceEnglish = parseFloat((priceJapanese * (enPremium + (Math.random() * 0.5))).toFixed(2));

                    // MEMORY OPTIMIZATION: Only store essential fields in the main array
                    const card = {
                        id: data.id,
                        name: data.name,
                        rarity: code,
                        set: item.setId, 
                        image: imgUrl,
                        priceEnglish: priceEnglish,
                        priceJapanese: priceJapanese,
                        percentChange: parseFloat(((Math.random() * 30) - 15).toFixed(2)),
                        volume: Math.floor(Math.random() * 500) + 10,
                        colors: data.colors || [],
                        type: data.category
                    };

                    cardDetails.push(card);
                } catch (err) {
                    // Fail silently
                }
            }));
            
            if (i % 300 === 0) {
                console.log(`Processed ${i} cards... (Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB)`);
                // Periodically clear unused references if needed
            }
            await new Promise(r => setTimeout(r, 80));
        }

        const jsonContent = JSON.stringify({ cards: cardDetails }); // No pretty printing to save disk space/memory during stringify
        fs.writeFileSync(CARDS_FILE, jsonContent);
        console.log(`Successfully saved ${cardDetails.length} cards to ${CARDS_FILE}`);
    } catch (error) {
        console.error('Script failed:', error);
    }
};

fetchCards();

