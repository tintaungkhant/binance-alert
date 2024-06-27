import { Browser as PuppeteerBrowser } from "puppeteer"
import * as dotenv from "dotenv";
import axios from "axios";
dotenv.config();
export default class Scraper {
    constructor(private browser: PuppeteerBrowser) {

    }

    async start() {
        try {
            const page = await this.browser.newPage();

            await page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED");

            console.log("Page loaded");

            console.log("Selecting currency");

            await this.delay(1);

            let currency_input_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/div[1]');
            let currency_input = await page.$(currency_input_xp);

            if (!currency_input) {
                console.log("Currency input not found");
                return;
            }

            console.log("Hovering over currency input");

            await currency_input.hover();

            let currency_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/div[2]/div/div/div[2]/div');

            let currency_buttons = Array.from(await page.$$(currency_xp));

            if (!currency_buttons.length) {
                console.log("Currency buttons not found");
                return;
            }

            console.log("Clicking currency button");

            let clicked_currency = false;

            for (let i = 0; i < currency_buttons.length; i++) {
                let currency_button = await page.evaluate((el) => el.textContent, currency_buttons[i]);

                currency_button = currency_button ? currency_button.trim() : "";

                if (currency_button === "MMK") {
                    await currency_buttons[i].click();

                    clicked_currency = true;
                    break;
                }
            }

            if (!clicked_currency) {
                console.log("Currency not found");
                return;
            }

            console.log("Currency selected");

            await this.delay(2);

            console.log("Selecting first item");

            let first_item_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[3]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]');

            let first_item = await page.$(first_item_xp);

            if (!first_item) {
                console.log("First item not found");
                return;
            }

            console.log("Selected first item");

            let price = await page.evaluate((el) => el.textContent, first_item);

            if (price) {
                const regex = /[^0-9]/g;
                price = price.replace(regex, "");

                let buy_price_threshold = process.env.BUY_PRICE_THRESHOLD;
                buy_price_threshold = buy_price_threshold ? buy_price_threshold : "0";

                console.info("Price: " + price);

                if (price <= buy_price_threshold) {
                    await this.sendToTelegram(price);
                }
            }

            await page.close();

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

    async sendToTelegram(price: string) {
        let token = process.env.TELEGRAM_BOT_TOKEN;

        let url = `https://api.telegram.org/bot${token}/sendMessage`;

        let params = {
            chat_id: process.env.TELEGRAM_GROUP_ID,
            text: `Price: ${price}`
        };

        await axios.get(url, {
            params
        });
    }
}