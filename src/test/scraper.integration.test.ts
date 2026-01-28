import { describe, it, expect } from 'vitest';
import { ScraperService } from '../services/scraper';

describe('Scraper Integration', () => {
    it('should scrape BookMyShow Mumbai', async () => {
        const service = new ScraperService();
        const events = await service.scrapeBookMyShow('mumbai');

        console.log(`Scraped ${events.length} events from BMS Mumbai`);

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].title).toBeDefined();
        expect(events[0].registration_url).toContain('bookmyshow.com');
    }, 60000); // 1 minute timeout
});
