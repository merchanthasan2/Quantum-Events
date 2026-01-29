import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    console.log('--- Categories Stats ---');
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name');

    if (catError) {
        console.error('Error fetching categories:', catError);
        return;
    }

    const { data: events, error: eventError } = await supabase
        .from('events')
        .select('category_id');

    if (eventError) {
        console.error('Error fetching events:', eventError);
        return;
    }

    const stats: Record<string, number> = {};
    events.forEach(e => {
        const name = categories.find(c => c.id === e.category_id)?.name || 'Unknown';
        stats[name] = (stats[name] || 0) + 1;
    });

    console.log('Counts:', stats);

    const movieCatId = categories.find(c => c.name === 'Movies')?.id;
    if (movieCatId) {
        const { data: movieEvents } = await supabase
            .from('events')
            .select('title, event_date')
            .eq('category_id', movieCatId)
            .limit(10);

        console.log('\n--- Recent Movies ---');
        console.log(movieEvents);
    } else {
        console.log('Movie category not found');
    }
}

checkCategories();
