import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
    const { data: events, error } = await supabase
        .from('events')
        .select('id, title, venue, address, city:cities(name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching events:', error);
        return;
    }

    console.log(`Total events fetched: ${events?.length}`);

    const cities = ['mumbai', 'pune', 'bangalore', 'delhi', 'chennai', 'kolkata', 'hyderabad'];

    const misaligned = events?.filter(e => {
        const cityName = (e.city as any)?.name?.toLowerCase();
        const otherCities = cities.filter(c => c !== cityName);
        const content = `${e.title} ${e.venue} ${e.address}`.toLowerCase();

        const isActuallyMisaligned = otherCities.some(oc => content.includes(oc));
        if (isActuallyMisaligned) {
            console.log(`Potential misalignment: "${e.title}" is in "${cityName}" but mentions other city.`);
        }
        return isActuallyMisaligned;
    });

    if (misaligned && misaligned.length > 0) {
        console.log(`\nFound ${misaligned.length} potentially misaligned events. Fixing...`);

        // Get all cities for mapping
        const { data: allCities } = await supabase.from('cities').select('*');
        if (!allCities) return;

        for (const e of misaligned) {
            const content = `${e.title} ${e.venue} ${e.address}`.toLowerCase();
            const actualCity = allCities.find(c => {
                const cityName = c.name.toLowerCase();
                const cityPattern = new RegExp(`\\b${cityName}\\b`, 'i');
                return cityPattern.test(content);
            });

            if (actualCity && actualCity.id !== (e.city as any).id) { // Corrected comparison to use e.city.id
                console.log(`  Updating "${e.title}": ${(e.city as any).name} -> ${actualCity.name}`);
                await supabase
                    .from('events')
                    .update({ city_id: actualCity.id })
                    .eq('id', e.id);
            }
        }
        console.log('Fix complete.');
    } else {
        console.log('\nNo obviously misaligned events found.');
    }
}

checkEvents();
