import puppeteer from 'puppeteer';
import { BookMyShowScraper } from './bms-scraper';
import { InsiderScraper } from './insider-scraper';
import { EventbriteScraper } from './eventbrite-scraper';
import { TenTimesScraper } from './tentimes-scraper';

export interface ScrapedEvent {
    title: string;
    description: string;
    short_description?: string;
    category: string;
    city: string;
    venue: string;
    address: string;
    event_date: string;
    event_time?: string;
    image_url: string;
    price_min: number;
    price_max: number;
    is_free: boolean;
    registration_url: string;
    source: string;
    source_id: string;
}

export class ScraperService {
    private bmsScraper = new BookMyShowScraper();
    private insiderScraper = new InsiderScraper();
    private eventbriteScraper = new EventbriteScraper();
    private tenTimesScraper = new TenTimesScraper();

    private async getBrowser() {
        return puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Faster but less secure
                '--disable-gpu'
            ]
        });
    }

    async scrapeBookMyShow(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const browser = existingBrowser || await this.getBrowser();
        try {
            return await this.bmsScraper.scrape(city, browser);
        } finally {
            if (!existingBrowser) await browser.close();
        }
    }

    async scrapeInsider(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const browser = existingBrowser || await this.getBrowser();
        try {
            return await this.insiderScraper.scrape(city, browser);
        } finally {
            if (!existingBrowser) await browser.close();
        }
    }

    async scrapeEventbrite(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const browser = existingBrowser || await this.getBrowser();
        try {
            return await this.eventbriteScraper.scrape(city, browser);
        } finally {
            if (!existingBrowser) await browser.close();
        }
    }

    async scrapeTenTimes(city: string, existingBrowser?: any): Promise<ScrapedEvent[]> {
        const browser = existingBrowser || await this.getBrowser();
        try {
            return await this.tenTimesScraper.scrape(city, browser);
        } finally {
            if (!existingBrowser) await browser.close();
        }
    }

    async runFullCycle() {
        const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'gurugram', 'noida'];
        const browser = await this.getBrowser();

        try {
            for (const city of cities) {
                const bmsEvents = await this.bmsScraper.scrape(city, browser);
                const insiderEvents = await this.insiderScraper.scrape(city, browser);
                const ebEvents = await this.eventbriteScraper.scrape(city, browser);
                const ttEvents = await this.tenTimesScraper.scrape(city, browser);

                console.log(`Processed ${bmsEvents.length + insiderEvents.length + ebEvents.length + ttEvents.length} events for ${city}`);
            }
        } finally {
            await browser.close();
        }
    }
}
