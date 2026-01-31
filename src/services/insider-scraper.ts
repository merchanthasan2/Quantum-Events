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

        const url = `https://www.district.in/${insiderCity}/events`;
        console.log(`  🔍 Scraping District (Insider): ${url}`);

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

            // Auto-Scroll to load more events
            await this.autoScroll(page);

            const events = await page.evaluate((cityName: string, sourceUrl: string) => {
                // District uses simple anchor tags for cards usually
                const cardLinks = Array.from(document.querySelectorAll('a[href*="/event/"]')) as HTMLAnchorElement[];

                return cardLinks
                    .map(link => {
                        const card = link.closest('div') || link;

                        // Text Extraction Strategy: Get all text lines
                        const textLines = card.innerText.split('\n').map(t => t.trim()).filter(Boolean);

                        // Heuristic:
                        // 1. Title is usually the first non-date line line, or matches h2/h3
                        const titleEl = card.querySelector('h2, h3, h4, div[class*="Title"]');
                        const title = titleEl?.textContent?.trim() || textLines.find(t => t.length > 5 && !t.includes('₹')) || '';

                        const href = link.href;
                        if (!title || !href || href.includes('/all-events')) return null;

                        // Image
                        const imageEl = card.querySelector('img');
                        let imageUrl = imageEl?.src || '';

                        // Price
                        let priceMin = 0;
                        const priceText = textLines.find(t => t.includes('₹') || t.toLowerCase().includes('free'));
                        if (priceText) {
                            if (priceText.toLowerCase().includes('free')) {
                                priceMin = 0;
                            } else {
                                const match = priceText.match(/[₹](\d+(?:,\d+)*)/);
                                if (match) priceMin = parseInt(match[1].replace(/,/g, ''));
                            }
                        }

                        // Date & Venue
                        // Date looks like "Sun, 25 Aug" or "Today" or "Tomorrow"
                        // Venue often at the bottom
                        const venue = textLines.find(t => t.length > 3 && t !== title && !t.includes('₹') && !t.includes('Event')) || 'District Venue';

                        return {
                            title: title,
                            description: `${textLines.join(' • ')}`, // Rich context in description
                            category: 'Events',
                            city: cityName,
                            venue: venue,
                            address: cityName,
                            event_date: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString(),
                            image_url: imageUrl,
                            price_min: priceMin,
                            price_max: priceMin,
                            is_free: priceMin === 0,
                            registration_url: href,
                            source: 'District.in',
                            source_id: href.split('/').pop() || Math.random().toString(36).substr(2, 9)
                        };
                    })
                    .filter(Boolean)
                    // Deduplicate by URL within the page scrape
                    .reduce((acc: any[], current: any) => {
                        if (!current) return acc;
                        const x = acc.find(item => item.registration_url === current.registration_url);
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            return acc;
                        }
                    }, []);
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

    private async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    // Deep scroll: 40000px ~ 40-50 viewports
                    if (totalHeight >= 40000 || totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
}
