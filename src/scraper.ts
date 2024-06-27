import { Page, Browser as PuppeteerBrowser } from "puppeteer"
import * as dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import { getCache, setCache } from "./helpers";
dotenv.config();
export default class Scraper {
    page!: Page
    constructor(private browser: PuppeteerBrowser) {

    }

    async start() {
        try {
            this.sendToTelegram("hie");
            return;
            this.page = await this.browser.newPage();

            await this.page.setViewport({ width: 600, height: 600 })

            await this.page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED");

            console.log("Page loaded");

            // await this.storeSiteSettings();

            // return;

            await this.setUpSiteSettings();

            console.log("Selecting currency");

            await this.delay(1);

            let currency_input_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div');
            let currency_input = await this.page.$(currency_input_xp);

            if (!currency_input) {
                console.log("Currency input not found");

                await this.sendToTelegram("Currency input not found")

                return;
            }

            console.log("Clicking over currency input");

            await currency_input.click();

            await this.delay(1);

            console.log("Searching currency");

            let currency_search_input_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]/div/input');

            let currency_search_input = await this.page.$(currency_search_input_xp);

            if (!currency_search_input) {
                console.log("Currency search input not found");

                await this.sendToTelegram("Currency search input not found");
                return;
            }

            console.log("Typing MMK");

            await currency_search_input.type("MMK", { delay: 200 });

            await this.delay(1);

            console.log("Clicking currency button");

            let currency_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div');

            let currency_button = await this.page.$(currency_xp);

            if (!currency_button) {
                console.log("Currency button not found");

                await this.sendToTelegram("Currency search input not found");
                return;
            }

            await currency_button.click();

            console.log("Currency selected");

            await this.delay(2);

            console.log("Selecting first item");

            let first_item_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[3]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]');

            let first_item = await this.page.$(first_item_xp);

            if (!first_item) {
                console.log("First item not found");

                await this.sendToTelegram("Currency search input not found");
                return;
            }

            console.log("Selected first item");

            let price = await this.page.evaluate((el) => el.textContent, first_item);

            if (price) {
                const regex = /[^0-9]/g;
                price = price.replace(regex, "");

                let buy_price_threshold = process.env.BUY_PRICE_THRESHOLD;
                buy_price_threshold = buy_price_threshold ? buy_price_threshold : "0";

                console.info("Price threshold " + buy_price_threshold);
                console.info("Price: " + price);

                if (price <= buy_price_threshold) {
                    await this.sendBuyPriceAlert(buy_price_threshold, price);
                }
            }

            await this.page.close();

            await this.browser.disconnect();

            console.log("Browser disconnected")
        } catch (error) {
            console.log(error)
        }
    }

    xpath(selector: string) {
        return `::-p-xpath(${selector})`;
    }

    async delay(seconds: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, seconds * 1000);
        });
    }

    async sendBuyPriceAlert(buy_price_threshold: string, price: string) {
        await this.sendToTelegram(`Price is below threshold\nThreshold: ${buy_price_threshold}\nPrice: ${price}`);
    }

    async sendToTelegram(text: string) {
        let token = process.env.TELEGRAM_BOT_TOKEN;

        let url = `https://api.telegram.org/bot${token}/sendMessage`;

        console.log(url);

        let group_id = process.env.TELEGRAM_GROUP_ID;

        let params = {
            chat_id: group_id ? group_id : "",
            text
        };

        await axios.get(url, { params }).catch((error) => {
            console.log(error);
        });
    }

    async storeSiteSettings() {
        let cookies = await this.page.cookies();

        fs.writeFileSync("site-settings/cookies.json", JSON.stringify(cookies, null, 2));

        let local_storage = await this.page.evaluate(() => {
            let json = {};
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);

                if (!key) continue;

                json[key] = localStorage.getItem(key);
            }
            return json;
        });

        fs.writeFileSync("site-settings/local_storage.json", JSON.stringify(local_storage, null, 2));
    }

    async setUpSiteSettings() {
        let cookies = fs.readFileSync("site-settings/cookies.json", "utf-8");

        if (cookies) {
            await this.page.setCookie(...JSON.parse(cookies));
        }

        let local_storage = fs.readFileSync("site-settings/local_storage.json", "utf-8");

        if (local_storage) {
            await this.page.evaluate((local_storage) => {
                for (let key in local_storage) {
                    localStorage.setItem(key, local_storage[key]);
                }
            }, JSON.parse(local_storage));
        }

        await this.page.reload();

        await this.delay(2);
    }
}