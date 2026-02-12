import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
    try {
        const url = 'https://en.onepiece-cardgame.com/cardlist/?series=430001';
        const res = await axios.get(url);
        console.log('--- Body Start ---');
        console.log(res.data.substring(0, 1000));
        const $ = cheerio.load(res.data);
        
        console.log('--- Searching for card indicators ---');
        
        // Try to find anything that looks like a card number
        $('.cardNumber').each((i, el) => console.log('Found cardNumber:', $(el).text()));
        
        // Try to find anything that looks like a card name
        $('.cardName').each((i, el) => console.log('Found cardName:', $(el).text()));

        // Try to find all images
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('cardlist')) {
                console.log('Found card-related image:', src);
            }
        });

        // If nothing found, search for any list items that might be cards
        if ($('.cardNumber').length === 0) {
            console.log('--- Searching broadly for list items ---');
            $('li').slice(0, 10).each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 5) {
                    console.log(`LI ${i}:`, text.substring(0, 50));
                }
            });
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testScrape();
