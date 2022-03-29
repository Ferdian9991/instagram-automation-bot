const puppeteer = require('puppeteer-extra')
const UserAgent = require('user-agents');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());

const fetch = async () => {
    const userAgent = new UserAgent([
        /Safari/,
        {
            connection: {
                type: 'wifi',
            },
            platform: 'MacIntel',
            deviceCategory: 'desktop'
        },
    ]);
    const onload = {
        args: [
            '--no-sandbox',
            '--incognito',
            '--netifs-to-ignore=INTERFACE_TO_IGNORE',
            '--disable-infobars',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0',
            `--user-agent=${userAgent.userAgent}`
        ],
        devtools: false,
        headless: false,
    }
    const browser = await puppeteer.launch(onload);
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    return {
        browser,
        page
    };
};

module.exports = {
    fetch
};