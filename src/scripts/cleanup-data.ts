import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIProcessingService } from '../services/ai-processing';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupData() {
    console.log('🧹 Starting Database Cleanup...');

    // 1. Fetch all active events
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', true);

    if (error) {
        console.error('Error fetching events:', error);
        return;
    }

    console.log(`🔍 Analyzing ${events.length} events...`);

    let removedMovies = 0;
    let recategorized = 0;

    const { data: categories } = await supabase.from('categories').select('*');
    if (!categories) return;

    for (const event of events) {
        const category = categories.find(c => c.id === event.category_id);
        const eventWithCat = { ...event, category: category?.name };

        // A. Check for re-releases or old movies
        const validation = await AIProcessingService.validateEvent(eventWithCat);
        if (!validation.isValid && (validation.reason?.includes('re-release') || validation.reason?.includes('old movie'))) {
            console.log(`🚫 Removing re-release: "${event.title}" (${validation.reason})`);
            await supabase.from('events').delete().eq('id', event.id);
            removedMovies++;
            continue;
        }

        // B. Re-normalize categories
        const correctCatName = AIProcessingService.normalizeCategory('Events', event.title, event.description);
        const correctCat = categories.find(c => c.name === correctCatName);

        if (correctCat && event.category_id !== correctCat.id) {
            console.log(`🏷️  Recategorizing "${event.title}": from ID ${event.category_id} to ${correctCatName}`);
            await supabase.from('events').update({ category_id: correctCat.id }).eq('id', event.id);
            recategorized++;
        }
    }

    console.log(`\n✅ Cleanup Complete!`);
    console.log(`🗑️  Removed ${removedMovies} re-released movies.`);
    console.log(`🔄 Recategorized ${recategorized} events.`);
}

cleanupData();
