import puppeteer from 'puppeteer';
import { ScrapedEvent } from './scraper';

const CITY_MAPPING: Record<string, string> = {
    'mumbai': 'mumbai',
    'delhi': 'national-capital-region-ncr',
    'bangalore': 'bengaluru',
    'hyderabad': 'hyderabad',
    'chennai': 'chennai',
    'kolkata': 'kolkata',
    'pune': 'pune',
    'gurugram': 'national-capital-region-ncr',
    'noida': 'national-capital-region-ncr'
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
                        let imageUrl = imageEl?.getAttribute('data-src') ||
                            imageEl?.getAttribute('data-lazy-src') ||
                            imageEl?.getAttribute('data-original') ||
                            imageEl?.src || '';

                        // Handle BMS Lazy Loading / Fallbacks
                        if (!imageUrl || imageUrl.includes('loading.gif') || imageUrl.includes('placeholder') || imageUrl.includes('data:image')) {
                            const srcset = imageEl?.getAttribute('srcset');
                            if (srcset) {
                                // Get the last URL in srcset (usually highest quality)
                                const candidates = srcset.split(',').map(s => s.trim().split(' ')[0]);
                                imageUrl = candidates[candidates.length - 1];
                            }
                        }

                        // Sanitize URL
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            // Handle relative protocols
                            if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                        }

                        // Force High-quality Transformation for BMS
                        if (imageUrl && imageUrl.includes('assethost')) {
                            // BMS images often have /et/ or /tr/ in path, replace with mobile/et for better quality or remove resizing params 
                            imageUrl = imageUrl.replace('/et', '/mobile/et');
                            imageUrl = imageUrl.replace(/\d+x\d+/, '500x500'); // generic replacement if dimensions exist
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

                        // Date Parsing Strategy
                        // Look for patterns like "Sun, 25 Aug" or "14 Feb"
                        let eventDate = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)); // Default to Today IST

                        const dateRegex = /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;
                        const dateMatchDetails = details.find(d => dateRegex.test(d));
                        const dateMatchText = allText.match(dateRegex);

                        const matchedDateStr = dateMatchDetails || (dateMatchText ? dateMatchText[0] : null);

                        if (matchedDateStr) {
                            const match = matchedDateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
                            if (match) {
                                const day = parseInt(match[1]);
                                const monthStr = match[2].toLowerCase();
                                const months: { [key: string]: number } = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
                                const month = months[monthStr];
                                const currentYear = new Date().getFullYear();

                                // Create date object (assume current year, if date is in past, maybe next year? BMS usually lists upcoming)
                                const parsedDate = new Date(currentYear, month, day, 19, 0, 0); // Default 7 PM

                                // Adjust if date is in the past (e.g. looking at Dec in Jan)
                                if (parsedDate < new Date() && month < new Date().getMonth()) {
                                    parsedDate.setFullYear(currentYear + 1);
                                }
                                eventDate = parsedDate;
                            }
                        }

                        return {
                            title: title,
                            description: `${languageMatch ? languageMatch + ' • ' : ''}${details.join(' ')}`, // Add language to description
                            category: catType, // 'Events' or 'Movies'
                            city: cityName,
                            venue: venue,
                            address: cityName,
                            event_date: eventDate.toISOString(),
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

                    // Extra deep scroll: 60000px to ensure we capture 100% of listing
                    if (totalHeight >= 60000 || totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
}
