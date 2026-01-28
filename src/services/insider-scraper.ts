import puppeteer from 'puppeteer';
import { ScrapedEvent } from './scraper';

const CITY_MAPPING: Record<string, string> = {
    'mumbai': 'mumbai',
    'delhi': 'delhi-ncr',
    'bangalore': 'bengaluru',
    'hyderabad': 'hyderabad',
    'chennai': 'chennai',
    'kolkata': 'kolkata',
    'pune': 'pune',
    'gurugram': 'delhi-ncr',
    'noida': 'delhi-ncr'
};

export class InsiderScraper {
    async scrape(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const insiderCity = CITY_MAPPING[city.toLowerCase()];
        if (!insiderCity) return [];

        // Insider has moved to District.in
        const url = `https://www.district.in/${insiderCity}/events`;
        console.log(`  🔍 Scraping District (formerly Insider): ${url}`);

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

            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for typical event card structures in the new UI
            await page.waitForSelector('a[href*="/event/"]', { timeout: 15000 }).catch(() => null);

            const events = await page.evaluate((cityName: string, sourceUrl: string) => {
                // Focus on links that go to events
                const cardLinks = Array.from(document.querySelectorAll('a[href*="/event/"]')) as HTMLAnchorElement[];

                return cardLinks
                    .map(link => {
                        const card = link.closest('div') || link;

                        // New District UI selectors
                        const titleEl = card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
                        const imageEl = card.querySelector('img');
                        const priceEl = card.querySelector('[class*="price"], [class*="Price"]');
                        const dateEl = card.querySelector('[class*="date"], [class*="Date"]');

                        const title = titleEl?.textContent?.trim() || '';
                        const href = link.href;

                        if (!title || !href || href.includes('/all-events')) return null;

                        return {
                            title: title,
                            description: dateEl?.textContent?.trim() || 'New event on District.in',
                            category: 'Events',
                            city: cityName,
                            venue: 'District Venue',
                            address: cityName,
                            event_date: new Date().toISOString(),
                            image_url: imageEl?.src || '',
                            price_min: parseInt(priceEl?.textContent?.replace(/[^0-9]/g, '') || '0'),
                            price_max: parseInt(priceEl?.textContent?.replace(/[^0-9]/g, '') || '0'),
                            is_free: priceEl?.textContent?.toLowerCase().includes('free') || false,
                            registration_url: href,
                            source: 'District.in',
                            source_id: href.split('/').pop() || Math.random().toString(36).substr(2, 9)
                        };
                    })
                    .filter(Boolean);
            }, city, url);

            return events as ScrapedEvent[];
        } catch (error) {
            console.error(`Error scraping Insider for ${city}:`, error);
            return [];
        } finally {
            if (ownsBrowser && browser) {
                await browser.close();
            }
        }
    }
}
