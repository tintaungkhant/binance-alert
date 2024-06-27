import puppeteer, { Browser as PuppeteerBrowser } from "puppeteer"
import { getCache, setCache } from "./helpers"

export default class Browser {
    browser!: PuppeteerBrowser

    async create() {
        let max_attempt = 2;
        let attempts = 0;

        do {
            try {
                attempts++;

                let wsEndpoint = await getCache("wsEndpoint");

                if (wsEndpoint) {
                    this.browser = await puppeteer.connect({
                        browserWSEndpoint: wsEndpoint
                    });

                    console.log("Browser connected");

                    return this.browser;
                }

                if (!wsEndpoint) {
                    this.browser = await puppeteer.launch({
                        userDataDir: "./user_data",
                        headless: true
                    });

                    wsEndpoint = this.browser.wsEndpoint();

                    await setCache("wsEndpoint", wsEndpoint);

                    console.log("Browser created");

                    return this.browser;
                }
            } catch (error) {
                if (attempts === max_attempt) {
                    console.log("Error at starting browser");
                } else {
                    await setCache("wsEndpoint", "");
                }
            }
        } while (attempts < max_attempt);
    }
}