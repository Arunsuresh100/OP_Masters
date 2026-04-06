import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key is missing in .env!');
} else {
    console.log('✅ Supabase initialized for:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    },
    global: {
        fetch: (...args) => fetch(...args).catch(err => {
            console.error('🌐 Supabase Fetch Error:', err.message);
            throw err;
        })
    }
});
