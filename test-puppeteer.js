const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        console.log('Puppeteer launched successfully');
        await browser.close();
    } catch (e) {
        console.error('Puppeteer failure:', e);
        process.exit(1);
    }
})();
