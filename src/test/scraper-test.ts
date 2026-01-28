const { ScraperService } = require('./src/services/scraper');
const path = require('path');

// Mocking imports since we are running in Node but files are TS
// Actually, since I have ts-node installed (potentially) or can use vitest, I'll use a small test.
// But for now, a simple JS script that I can run with node if I compiled it.
// Alternatively, I'll use a small test file in vitest.

async function test() {
    const service = new ScraperService();
    console.log('Starting test scrape of Mumbai...');
    const events = await service.scrapeBookMyShow('mumbai');
    console.log(`Found ${events.length} events!`);
    if (events.length > 0) {
        console.log('First event:', events[0].title);
        console.log('Registration URL:', events[0].registration_url);
    }
}

test();
