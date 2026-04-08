import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspectTable() {
    try {
        console.log("Inspecting 'users' table...");
        const { data, error } = await supabase.from('users').select('*').limit(1);
        
        if (error) {
            console.error('❌ Error reading users table:', error.message);
            if (error.message.includes("relation \"public.users\" does not exist")) {
                console.log("TIP: You need to create the 'users' table in Supabase SQL Editor.");
            }
        } else {
            console.log('✅ Users table exists.');
            if (data && data.length > 0) {
                console.log('Sample columns found:', Object.keys(data[0]).join(', '));
            } else {
                console.log('Table is empty, cannot auto-detect columns via SELECT *');
            }
        }
    } catch (err) {
        console.error('💥 Fatal Error:', err.message);
    }
}

inspectTable();
