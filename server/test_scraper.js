import axios from 'axios';
import * as cheerio from 'cheerio';

async function testFetch() {
    try {
        const response = await axios.get('https://en.onepiece-cardgame.com/topics/');
        const $ = cheerio.load(response.data);
        
        console.log('--- Page Title ---');
        console.log($('title').text());

        if ($('dl').length > 0) {
            $('dl').slice(0, 3).each((i, dl) => {
                const $dl = $(dl);
                const parentA = $dl.closest('a');
                const link = parentA.attr('href') || $dl.find('a').not('.topicCategory a').attr('href');
                
                console.log(`--- News Item ${i} ---`);
                console.log('Title:', $dl.find('.topicTit').text().trim());
                console.log('Date:', $dl.find('.topicDate').text().trim());
                console.log('Category:', $dl.find('.topicCategory').text().trim());
                console.log('Link:', link);
            });
        }
    } catch (error) {
        console.error('Error fetching:', error.message);
    }
}

testFetch();
