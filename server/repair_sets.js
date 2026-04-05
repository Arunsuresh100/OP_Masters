import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARDS_FILE = path.join(__dirname, 'cards.json');

if (fs.existsSync(CARDS_FILE)) {
    const data = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
    let count = 0;
    data.cards = data.cards.map(card => {
        let oldSet = card.set;
        // Clean up: OP15-EB04 -> OP15, ST-29 -> ST29, P -> P
        let newSet = oldSet.split('-')[0].replace(/\s+/g, '');
        if (oldSet !== newSet) {
            card.set = newSet;
            count++;
        }
        return card;
    });
    fs.writeFileSync(CARDS_FILE, JSON.stringify(data, null, 2));
    console.log(`[RE-MAP] Success! Updated ${count} card set IDs for filter compatibility.`);
} else {
    console.error('[RE-MAP] cards.json not found!');
}
