import puppeteer from 'puppeteer';
import { ScrapedEvent } from './scraper';

const CITY_MAPPING: Record<string, string> = {
    'mumbai': 'mumbai',
    'delhi': 'ncr',
    'bangalore': 'bengaluru',
    'hyderabad': 'hyderabad',
    'chennai': 'chennai',
    'kolkata': 'kolkata',
    'pune': 'pune',
    'gurugram': 'ncr',
    'noida': 'ncr'
};

export class BookMyShowScraper {
    async scrape(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const bmsCity = CITY_MAPPING[city.toLowerCase()];
        if (!bmsCity) return [];

        const url = `https://in.bookmyshow.com/explore/events-${bmsCity}`;
        console.log(`  🔍 Scraping BookMyShow: ${url}`);

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
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for the event cards to load
            // Note: BMS uses dynamic class names often, but common attributes exist
            const events = await page.evaluate((cityName: string, sourceUrl: string) => {
                const cards = Array.from(document.querySelectorAll('a[href*="/events/"]')) as HTMLAnchorElement[];

                return cards
                    .map(card => {
                        const href = card.href;
                        // Avoid generic explore links or empty URLs
                        if (!href || href.includes('explore/events') || href.endsWith('/events/')) return null;

                        const titleEl = card.querySelector('h3') || card.querySelector('div[font-size]');
                        const imageEl = card.querySelector('img');

                        // Get all text content from the card to find price/venue
                        const allText = card.innerText || '';
                        const details = allText.split('\n').map(t => t.trim()).filter(Boolean);

                        const title = titleEl?.textContent?.trim() || '';

                        // Filter out Movies, Cinemas, and empty titles
                        const lowerTitle = title.toLowerCase();
                        if (!title ||
                            href.includes('/movies/') ||
                            href.includes('/cinemas/') ||
                            lowerTitle.includes('movie') ||
                            lowerTitle.includes('film') ||
                            lowerTitle.includes('cinema')) {
                            return null;
                        }

                        // Try to get price from all text
                        let priceMin = 0;
                        const priceMatch = allText.match(/[₹Rs]\.?\s*(\d+(?:,\d+)*)/i);
                        if (priceMatch) {
                            priceMin = parseInt(priceMatch[1].replace(/,/g, ''));
                        }

                        const isFree = allText.toLowerCase().includes('free');

                        // Try to get the highest resolution image
                        let imageUrl = imageEl?.src || '';
                        const dataSrc = imageEl?.getAttribute('data-src');
                        if (dataSrc && (!imageUrl || imageUrl.includes('placeholder'))) {
                            imageUrl = dataSrc;
                        }

                        return {
                            title: title,
                            description: details.join(' '),
                            category: 'Events',
                            city: cityName,
                            venue: details.find(d => d.length > 5 && d.length < 50) || 'Multiple Venues',
                            address: cityName,
                            event_date: new Date().toISOString(),
                            image_url: imageUrl,
                            price_min: priceMin,
                            price_max: priceMin,
                            is_free: isFree || false,
                            registration_url: href,
                            source: 'BookMyShow',
                            source_id: href.split('/').pop() || ''
                        };
                    })
                    .filter(Boolean);
            }, city, url);

            return events as ScrapedEvent[];
        } catch (error) {
            console.error(`Error scraping BMS for ${city}:`, error);
            return [];
        } finally {
            if (ownsBrowser && browser) {
                await browser.close();
            }
        }
    }
}
