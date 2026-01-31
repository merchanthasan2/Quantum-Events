import { supabase } from '../lib/supabase';
import { ScraperService, ScrapedEvent } from './scraper';
import { AIProcessingService } from './ai-processing';
import { EventbriteApiService } from './eventbrite-api';

export class DataSyncService {
    private scraper = new ScraperService();
    private eventbriteApi = new EventbriteApiService();

    async syncAll() {
        console.log('🚀 [DataSync] Starting Full Synchronization...');
        // Sync all major cities
        const cities = ['mumbai', 'bangalore', 'pune', 'hyderabad', 'delhi', 'chennai', 'kolkata', 'gurugram', 'noida'];

        // 1. Get existing cities and categories from DB for mapping
        const { data: dbCities, error: cityError } = await supabase.from('cities').select('*');
        const { data: dbCategories, error: catError } = await supabase.from('categories').select('*');

        if (cityError || catError || !dbCities || !dbCategories) {
            console.error('❌ [DataSync] Failed to fetch reference data:', cityError || catError || 'Unknown error');
            return;
        }

        console.log(`📦 Found ${dbCities.length} cities and ${dbCategories.length} categories in DB.`);

        for (const citySlug of cities) {
            try {
                await this.syncCity(citySlug, dbCities, dbCategories);
            } catch (err) {
                console.error(`  ❌ Critical error syncing ${citySlug}:`, err);
            }
        }

        console.log('\n✨ [DataSync] Synchronization Cycle Complete!');
    }

    private async syncCity(citySlug: string, dbCities: any[], dbCategories: any[]) {
        console.log(`\n🏙️  [DataSync] Syncing city: ${citySlug.toUpperCase()}`);

        const browser = await this.scraper['getBrowser']();
        try {
            // 1. Fetch from Scrapers
            const [bmsEvents, insiderEvents, ebScraped, ttEvents] = await Promise.all([
                this.scraper.scrapeBookMyShow(citySlug, browser).catch(err => {
                    console.error(`  - BMS Scraper failed for ${citySlug}:`, err.message);
                    return [];
                }),
                this.scraper.scrapeInsider(citySlug, browser).catch(err => {
                    console.error(`  - Insider Scraper failed for ${citySlug}:`, err.message);
                    return [];
                }),
                this.scraper.scrapeEventbrite(citySlug, browser).catch(err => {
                    console.error(`  - Eventbrite Scraper failed for ${citySlug}:`, err.message);
                    return [];
                }),
                this.scraper.scrapeTenTimes(citySlug, browser).catch(err => {
                    console.error(`  - 10Times Scraper failed for ${citySlug}:`, err.message);
                    return [];
                })
            ]);

            // 2. Fetch from Eventbrite API (Deprecated/Rate-limited)
            /*
            const ebApiEntries = await this.eventbriteApi.fetchEvents(citySlug).catch(err => {
                console.error(`  - Eventbrite API failed for ${citySlug}:`, err.message);
                return [];
            });
            */
            const ebApiEntries: ScrapedEvent[] = [];

            // 3. Combine and Monetize Eventbrite entries
            const allEb = [...ebScraped, ...ebApiEntries].map(ev => ({
                ...ev,
                registration_url: ev.source.toLowerCase().includes('eventbrite')
                    ? this.eventbriteApi.applyAffiliate(ev.registration_url)
                    : ev.registration_url
            }));

            let allEvents = [...bmsEvents, ...insiderEvents, ...allEb, ...ttEvents];

            // FIX: Normalize City Name locally to ensure mapping works
            // This ensures 'bengaluru' from scraper becomes 'bangalore' matching our DB
            allEvents.forEach(ev => {
                ev.city = citySlug;
            });



            // SORT: By Date (Ascending - Recent first)
            allEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

            // LIMIT: Max 100 events
            if (allEvents.length > 100) {
                console.log(`  ✂️ Limiting ${allEvents.length} events to 100 recent ones.`);
                allEvents = allEvents.slice(0, 100);
            }

            console.log(`  📈 Found ${allEvents.length} total events for ${citySlug} (Unique & Sorted)`);

            let savedCount = 0;
            let skippedCount = 0;

            for (const event of allEvents) {
                const result = await this.processAndSaveEvent(event, dbCities, dbCategories);
                if (result) savedCount++;
                else skippedCount++;
            }

            console.log(`  ✅ ${citySlug}: Saved ${savedCount}, Skipped ${skippedCount}`);

        } finally {
            await browser.close();
        }
    }

    private async processAndSaveEvent(scraped: ScrapedEvent, cities: any[], categories: any[]): Promise<boolean> {
        // 1. AI Validation (Heuristic for now)
        // Temporarily disabled to avoid fetch failed error without valid ANTHROPIC_API_KEY
        /*
        const validation = await AIProcessingService.validateEvent(scraped);
        if (!validation.isValid) {
            return false;
        }
        */

        // 2. Map to City ID
        let city = cities.find(c => c.slug === scraped.city.toLowerCase() || c.name.toLowerCase() === scraped.city.toLowerCase());

        // Cross-validation
        const contentContext = `${scraped.title} ${scraped.venue} ${scraped.address}`.toLowerCase();
        const otherMajorCities = cities.filter(c => c.id !== city?.id);

        for (const otherCity of otherMajorCities) {
            const cityName = otherCity.name.toLowerCase();
            const cityPattern = new RegExp(`\\b${cityName}\\b`, 'i');

            if (cityPattern.test(contentContext)) {
                console.log(`  ⚠️ Re-assigning "${scraped.title}" from ${city?.name} to ${otherCity.name} based on content.`);
                city = otherCity;
                break;
            }
        }

        if (!city) return false;

        // 3. Map to Category ID
        const normalizedCatName = AIProcessingService.normalizeCategory(scraped.category, scraped.title, scraped.description);
        const category = categories.find(c => c.name === normalizedCatName) ||
            categories.find(c => c.name.toLowerCase() === normalizedCatName.toLowerCase()) ||
            categories.find(c => c.name === 'Events') ||
            categories[0];

        if (!category) return false;

        // 4. Duplicate Check
        // Improve duplicate check to look for (title + date) combination to catch cross-provider duplicates
        const { data: similar } = await supabase
            .from('events')
            .select('id, image_url')
            .eq('title', scraped.title)
            .eq('event_date', scraped.event_date) // Assuming exact date match for now
            .maybeSingle();

        const [regCheck, sourceCheck] = await Promise.all([
            supabase.from('events').select('id').eq('registration_url', scraped.registration_url).maybeSingle(),
            supabase.from('events').select('id').eq('source_id', scraped.source_id).maybeSingle()
        ]);

        const existing = regCheck.data || sourceCheck.data || similar;

        // Image validation: If image is empty or placeholder, try not to overwrite existing good image
        let finalImage = scraped.image_url;
        if (existing && existing.image_url && (!finalImage || finalImage.includes('placeholder'))) {
            finalImage = existing.image_url;
        }

        // --- AFFILIATE / TRACKING LOGIC ---
        const taggedUrl = this.addReferralParams(scraped.registration_url);

        const eventData = {
            title: scraped.title,
            description: scraped.description,
            short_description: scraped.short_description || scraped.title,
            category_id: category.id,
            city_id: city.id,
            venue: scraped.venue,
            address: scraped.address,
            event_date: scraped.event_date,
            event_time: scraped.event_time || '19:00:00',
            image_url: finalImage,
            registration_url: taggedUrl,
            ticket_price_min: scraped.price_min,
            ticket_price_max: scraped.price_max,
            is_free: scraped.is_free,
            source: scraped.source,
            source_id: scraped.source_id,
            is_approved: true,
            is_featured: Math.random() > 0.9
        };

        if (existing) {
            const { error } = await supabase.from('events').update(eventData).eq('id', existing.id);
            if (error) return false;
        } else {
            const { error } = await supabase.from('events').insert([eventData]);
            if (error) return false;
        }

        return true;
    }

    private addReferralParams(url: string): string {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('ref', 'aajkascene');
            urlObj.searchParams.set('utm_source', 'aajkascene');
            urlObj.searchParams.set('utm_medium', 'affiliate');
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }
}
