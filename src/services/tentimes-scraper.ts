import puppeteer from 'puppeteer';
import { ScrapedEvent } from './scraper';

const CITY_MAPPING: Record<string, string> = {
    'mumbai': 'mumbai',
    'delhi': 'new-delhi',
    'bangalore': 'bengaluru',
    'hyderabad': 'hyderabad',
    'chennai': 'chennai',
    'kolkata': 'kolkata',
    'pune': 'pune',
    'gurugram': 'gurgaon',
    'noida': 'noida'
};

export class TenTimesScraper {
    async scrape(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const ttCity = CITY_MAPPING[city.toLowerCase()];
        if (!ttCity) return [];

        // 10times URL Structure: https://10times.com/mumbai
        const url = `https://10times.com/${ttCity}`;
        console.log(`  🔍 Scraping 10Times: ${url}`);

        let browser = existingBrowser;
        let ownsBrowser = false;

        if (!browser) {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            ownsBrowser = true;
        }

        try {
            const page = await browser.newPage();
            // 10times has strong bot detection, randomize generic user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for event rows. 10Times usually lists events in a table or list rows
            await page.waitForSelector('#content, #event-table, .event-card, tr.event-row', { timeout: 15000 }).catch(() => null);

            const events = await page.evaluate((cityName: string) => {
                // 10Times structure varies but often uses table rows (tr) for events in listing
                const rows = Array.from(document.querySelectorAll('tr[itemtype="http://schema.org/Event"], tr.row, div.event-card')) as HTMLElement[];

                return rows
                    .map(row => {
                        // Title
                        const titleEl = row.querySelector('a[itemprop="url"], h2 a, h3 a, .event-name');
                        const title = titleEl?.textContent?.trim() || '';

                        // Link
                        const href = (titleEl as HTMLAnchorElement)?.href || '';

                        if (!title || !href) return null;

                        // Date
                        // "15 - 17 Feb 2026"
                        const dateEl = row.querySelector('span[content], .date, td:first-child');
                        const dateStr = dateEl?.textContent?.trim() || '';

                        // Venue
                        const venueEl = row.querySelector('.venue, td:nth-child(2)');
                        const venue = venueEl?.textContent?.trim() || 'Exhibition Centre';

                        // 10Times focuses on Exhibitions/Trade Shows usually
                        // We can try to infer category or default to 'Exhibitions'

                        // Image (often missing in table view, but might be in detailed view - skip for lightweight list scrape)
                        // If they have thumbnails:
                        const imgEl = row.querySelector('img');
                        let imageUrl = imgEl?.src || '';
                        if (imageUrl.includes('blank') || imageUrl.includes('placeholder')) imageUrl = '';

                        return {
                            title: title,
                            description: `Exhibition/Conference at ${venue}. ${dateStr}`,
                            category: 'Exhibitions', // Safe default for 10times
                            city: cityName,
                            venue: venue,
                            address: cityName,
                            event_date: new Date().toISOString(),
                            image_url: imageUrl,
                            price_min: 0,
                            price_max: 0,
                            is_free: false, // Usually trade shows need registration
                            registration_url: href,
                            source: '10Times',
                            source_id: href.split('/').pop() || Math.random().toString(36).substr(2, 9)
                        };
                    })
                    .filter(Boolean);
            }, city);

            return events as ScrapedEvent[];

        } catch (error) {
            console.error(`Error scraping 10Times for ${city}:`, error);
            // 10times is strict, often fails with 403. Return empty safely.
            return [];
        } finally {
            if (ownsBrowser && browser) {
                await browser.close();
            }
        }
    }
}
