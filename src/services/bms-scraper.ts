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

            // 1. Scrape Events
            const eventsUrl = `https://in.bookmyshow.com/explore/events-${bmsCity}`;
            console.log(`  🔍 Scraping BMS Events: ${eventsUrl}`);
            const events = await this.scrapeUrl(page, eventsUrl, bmsCity, 'Events');

            // 2. Scrape Movies
            const moviesUrl = `https://in.bookmyshow.com/explore/movies-${bmsCity}`;
            console.log(`  🔍 Scraping BMS Movies: ${moviesUrl}`);
            const movies = await this.scrapeUrl(page, moviesUrl, bmsCity, 'Movies');

            return [...events, ...movies];

        } catch (error) {
            console.error(`Error scraping BMS for ${city}:`, error);
            return [];
        } finally {
            if (ownsBrowser && browser) {
                await browser.close();
            }
        }
    }

    private async scrapeUrl(page: any, url: string, city: string, categoryType: 'Events' | 'Movies'): Promise<ScrapedEvent[]> {
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Auto-scroll to load more items
            await this.autoScroll(page);

            return await page.evaluate((cityName: string, catType: string) => {
                const selector = catType === 'Events' ? 'a[href*="/events/"]' : 'a[href*="/movies/"]';
                const cards = Array.from(document.querySelectorAll(selector)) as HTMLAnchorElement[];

                return cards
                    .map(card => {
                        const href = card.href;
                        if (!href || href.includes('explore/events') || href.endsWith('/events/') || href.includes('explore/movies')) return null;

                        const titleEl = card.querySelector('h3') || card.querySelector('div[font-size="18"]') || card.querySelector('div[class*="sc-7o7nez-0"]');

                        // Attempt to find Image
                        const imageEl = card.querySelector('img');
                        let imageUrl = imageEl?.src || '';
                        const dataSrc = imageEl?.getAttribute('data-src');
                        if (dataSrc && (!imageUrl || imageUrl.includes('placeholder'))) {
                            imageUrl = dataSrc;
                        }

                        // Text Content Extraction
                        const allText = card.innerText || '';
                        const details = allText.split('\n').map(t => t.trim()).filter(Boolean);

                        let title = titleEl?.textContent?.trim() || '';
                        if (!title && details.length > 0) title = details[0]; // Fallback to first line

                        const lowerTitle = title.toLowerCase();

                        // -- MOVIE SPECIFIC CHECKS --
                        if (catType === 'Movies') {
                            // Exclude Re-releases if requested
                            if (lowerTitle.includes('re-release') || lowerTitle.includes('rerelease')) return null;
                        }

                        // -- EVENT SPECIFIC CHECKS --
                        if (catType === 'Events') {
                            // Double check parsing didn't pick up garbage
                            if (!title) return null;
                        }

                        // Extract Language (often in details like "Hindi, English")
                        // Common for Movies: "UA • 2h 30m • Hindi, Tamil"
                        const languageMatch = details.find(d =>
                            d.includes('Hindi') || d.includes('English') || d.includes('Marathi') ||
                            d.includes('Tamil') || d.includes('Telugu') || d.includes('Kannada') ||
                            d.includes('Malayalam')
                        );

                        // Price extraction
                        let priceMin = 0;
                        const priceMatch = allText.match(/[₹Rs]\.?\s*(\d+(?:,\d+)*)/i);
                        if (priceMatch) {
                            priceMin = parseInt(priceMatch[1].replace(/,/g, ''));
                        }
                        const isFree = allText.toLowerCase().includes('free');

                        // Venue Logic
                        let venue = 'Multiple Venues';
                        if (catType === 'Movies') {
                            venue = 'Multiple Cinemas';
                        } else {
                            // Try to find a string that looks like a venue (longer than 5 chars, not a date)
                            const candidate = details.find(d => d.length > 5 && d.length < 50 && !d.includes('₹') && !d.match(/\d{1,2}:\d{2}/));
                            if (candidate) venue = candidate;
                        }

                        return {
                            title: title,
                            description: `${languageMatch ? languageMatch + ' • ' : ''}${details.join(' ')}`, // Add language to description
                            category: catType, // 'Events' or 'Movies'
                            city: cityName,
                            venue: venue,
                            address: cityName,
                            event_date: new Date().toISOString(), // Movies often imply "Now Showing"
                            image_url: imageUrl,
                            price_min: priceMin,
                            price_max: priceMin,
                            is_free: isFree,
                            registration_url: href,
                            source: 'BookMyShow',
                            source_id: href.split('/').pop() || ''
                        };
                    })
                    .filter(Boolean);
            }, city, categoryType);
        } catch (e) {
            console.error(`Error scraping ${categoryType} for ${city}:`, e);
            return [];
        }
    }

    private async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 200; // Faster scroll
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    // Deep scroll: 15000px ~ 20-30 viewports
                    // This ensures we get almost everything loaded on the page
                    if (totalHeight >= 15000 || totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
}
