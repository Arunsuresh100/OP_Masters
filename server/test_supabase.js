import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Connection Failed:', error.message);
        } else {
            console.log('✅ Connection Successful! Found users count:', data);
        }
    } catch (err) {
        console.error('💥 Fatal Error:', err.message);
    }
}

test();
