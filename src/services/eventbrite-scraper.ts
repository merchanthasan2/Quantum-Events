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
    'gurugram': 'gurugram',
    'noida': 'noida'
};

export class EventbriteScraper {
    async scrape(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const ebCity = CITY_MAPPING[city.toLowerCase()];
        if (!ebCity) return [];

        // Eventbrite URL Structure: https://www.eventbrite.com/d/india--mumbai/events/
        const url = `https://www.eventbrite.com/d/india--${ebCity}/events/`;
        console.log(`  🔍 Scraping Eventbrite: ${url}`);

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
            // Eventbrite is bot-heavy, so we need a good user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for event cards
            await page.waitForSelector('section.event-card-details, .event-card, article', { timeout: 15000 }).catch(() => null);

            // Auto-scroll a bit to ensure lazy images load
            await this.autoScroll(page);

            const events = await page.evaluate((cityName: string) => {
                // Select all article elements which usually represent cards
                const cards = Array.from(document.querySelectorAll('section[data-testid="event-card"], article.ids-event-card, div.search-event-card-wrapper')) as HTMLElement[];

                return cards
                    .map(card => {
                        // Title
                        const titleEl = card.querySelector('h2, h3, [data-testid="event-card-title"]');
                        const title = titleEl?.textContent?.trim() || '';

                        // Link
                        const linkEl = card.querySelector('a.event-card-link, a[href*="/e/"]') as HTMLAnchorElement;
                        const href = linkEl?.href || '';

                        if (!title || !href) return null;

                        // Date
                        // "Sat, Aug 24, 7:00 PM"
                        const dateEl = card.querySelector('[data-testid="event-card-date"], .Typography_body-md__4be26');
                        const dateStr = dateEl?.textContent?.trim() || '';

                        // Location
                        // "The Habitat • Mumbai"
                        const locEl = card.querySelector('[data-testid="event-card-location"]');
                        let venue = locEl?.textContent?.trim() || 'Eventbrite Venue';
                        // Remove "• Mumbai" if present to just get venue name
                        venue = venue.split('•')[0].trim();

                        // Image
                        const imgEl = card.querySelector('img');
                        let imageUrl = imgEl?.src || '';
                        if (imageUrl.includes('placeholder')) imageUrl = '';

                        // Price
                        // "Starts at ₹499" or "Free"
                        const priceEl = card.querySelector('[data-testid="event-card-price"]');
                        const priceText = priceEl?.textContent?.trim() || '';

                        let priceMin = 0;
                        let isFree = false;

                        if (priceText.toLowerCase().includes('free')) {
                            isFree = true;
                        } else {
                            const match = priceText.match(/[₹Rs]\.?\s*(\d+(?:,\d+)*)/);
                            if (match) {
                                priceMin = parseInt(match[1].replace(/,/g, ''));
                            }
                        }

                        return {
                            title: title,
                            description: `${dateStr} at ${venue}`,
                            category: 'Events',
                            city: cityName,
                            venue: venue,
                            address: cityName, // Eventbrite doesn't always show full address on card
                            event_date: new Date().toISOString(), // We'd need to parse dateStr to be accurate, defaulting for now
                            image_url: imageUrl,
                            price_min: priceMin,
                            price_max: priceMin,
                            is_free: isFree,
                            registration_url: href,
                            source: 'Eventbrite',
                            source_id: href.split('-').pop() || Math.random().toString(36).substr(2, 9)
                        };
                    })
                    .filter(Boolean);
            }, city);

            return events as ScrapedEvent[];

        } catch (error) {
            console.error(`Error scraping Eventbrite for ${city}:`, error);
            return [];
        } finally {
            if (ownsBrowser && browser) {
                await browser.close();
            }
        }
    }

    private async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                // Scroll just a bit to trigger lazy loading
                const maxScroll = 2000;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= maxScroll || totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
}
