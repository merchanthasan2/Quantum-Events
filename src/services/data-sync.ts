import { supabase } from '../lib/supabase';
import { ScraperService, ScrapedEvent } from './scraper';
import { AIProcessingService } from './ai-processing';
import puppeteer from 'puppeteer';

export class DataSyncService {
    private scraper = new ScraperService();

    async syncAll() {
        console.log('🚀 [DataSync] Starting Full Synchronization...');
        const cities = ['mumbai', 'bangalore', 'pune', 'hyderabad', 'delhi', 'chennai', 'kolkata'];

        // 1. Get existing cities and categories from DB for mapping
        const { data: dbCities, error: cityError } = await supabase.from('cities').select('*');
        const { data: dbCategories, error: catError } = await supabase.from('categories').select('*');

        if (cityError || catError || !dbCities || !dbCategories) {
            console.error('❌ [DataSync] Failed to fetch reference data:', cityError || catError || 'Unknown error');
            return;
        }

        console.log(`📦 Found ${dbCities.length} cities and ${dbCategories.length} categories in DB.`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            for (const citySlug of cities) {
                try {
                    console.log(`\n🏙️  [DataSync] Syncing city: ${citySlug.toUpperCase()}`);

                    // Fetch from all sources using the same browser
                    const [bmsEvents, insiderEvents, ebEvents, ttEvents] = await Promise.all([
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

                    const allScraped = [...bmsEvents, ...insiderEvents, ...ebEvents, ...ttEvents];
                    console.log(`  📈 Found ${allScraped.length} events (${bmsEvents.length} BMS, ${insiderEvents.length} Insider, ${ebEvents.length} Eventbrite, ${ttEvents.length} 10Times)`);

                    let savedCount = 0;
                    let skippedCount = 0;

                    for (const event of allScraped) {
                        const result = await this.processAndSaveEvent(event, dbCities, dbCategories);
                        if (result) savedCount++;
                        else skippedCount++;
                    }

                    console.log(`  ✅ ${citySlug}: Saved ${savedCount}, Skipped ${skippedCount}`);

                } catch (err) {
                    console.error(`  ❌ Critical error syncing ${citySlug}:`, err);
                }
            }
        } finally {
            await browser.close();
        }
        console.log('\n✨ [DataSync] Synchronization Cycle Complete!');
    }

    private async processAndSaveEvent(scraped: ScrapedEvent, cities: any[], categories: any[]): Promise<boolean> {
        // 1. AI Validation (Heuristic for now)
        const validation = await AIProcessingService.validateEvent(scraped);
        if (!validation.isValid) {
            return false;
        }

        // 2. Map to City ID
        // Default to target city, but double check address for drift
        let city = cities.find(c => c.slug === scraped.city.toLowerCase() || c.name.toLowerCase() === scraped.city.toLowerCase());

        // Cross-validation: Check if venue/address explicitly mentions another major city
        // (Solves "Kolkata events appearing in Mumbai" issue)
        const addressContent = `${scraped.venue} ${scraped.address}`.toLowerCase();
        const otherMajorCities = cities.filter(c => c.id !== city?.id);

        for (const otherCity of otherMajorCities) {
            // Check if address *ends with* city name or contains "City, State" pattern
            if (addressContent.includes(otherCity.name.toLowerCase())) {
                console.log(`  ⚠️ Re-assigning ${scraped.title} from ${city?.name} to ${otherCity.name} based on address.`);
                city = otherCity;
                break;
            }
        }

        if (!city) return false;

        // 3. Normalize and Map to Category ID
        const normalizedCatName = AIProcessingService.normalizeCategory(scraped.category, scraped.title, scraped.description);
        const category = categories.find(c => c.name === normalizedCatName) ||
            categories.find(c => c.name.toLowerCase() === normalizedCatName.toLowerCase()) ||
            categories.find(c => c.name === 'Events') ||
            categories.find(c => c.id === 'meetups') ||
            categories[0];

        if (!category) return false;

        // 4. Check for duplicates in DB (Separate queries for safety with complex URLs)
        const [regCheck, sourceCheck] = await Promise.all([
            supabase.from('events').select('id').eq('registration_url', scraped.registration_url).maybeSingle(),
            supabase.from('events').select('id').eq('source_id', scraped.source_id).maybeSingle()
        ]);

        const existing = regCheck.data || sourceCheck.data;

        // --- AFFILIATE / TRACKING LOGIC ---
        // Automatically append referral tags to prove traffic attribution
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
            image_url: scraped.image_url,
            registration_url: taggedUrl,
            ticket_price_min: scraped.price_min,
            ticket_price_max: scraped.price_max,
            is_free: scraped.is_free,
            source: scraped.source,
            source_id: scraped.source_id,
            is_approved: true, // Auto-approve scraped events for testing
            is_featured: Math.random() > 0.9 // Randomly feature some for UI variety
        };

        if (existing) {
            // Update
            const { error } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', existing.id);
            if (error) {
                console.error(`  - Error updating "${scraped.title}":`, error.message);
                return false;
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('events')
                .insert([eventData]);
            if (error) {
                console.error(`  - Error inserting "${scraped.title}":`, error.message);
                return false;
            }
        }

        return true;
    }

    /**
     * Appends affiliate and tracking parameters to outgoing URLs.
     * This creates "proof of work" for future partnership negotiations.
     */
    private addReferralParams(url: string): string {
        try {
            const urlObj = new URL(url);

            // 1. Generic Ref Param (Proof of traffic)
            urlObj.searchParams.set('ref', 'quantumevents');

            // 2. Standard UTM Params (Google Analytics compatible)
            urlObj.searchParams.set('utm_source', 'quantumevents');
            urlObj.searchParams.set('utm_medium', 'listing');
            urlObj.searchParams.set('utm_campaign', 'organic_discovery');

            return urlObj.toString();
        } catch (e) {
            // If URL is invalid, return as is
            return url;
        }
    }
}
