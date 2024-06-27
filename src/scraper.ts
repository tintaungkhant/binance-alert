import puppeteer, { Browser as PuppeteerBrowser } from "puppeteer"

export default class Scraper {
    constructor(private browser: PuppeteerBrowser) {

    }

    async start() {
        try {
            const page = await this.browser.newPage();

            await page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED");

            this.delay(2);

            let aa = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/div[1]');
            let bb = await page.$(aa);

            if(bb){
                await bb.hover();
            }

            let cc = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/div[2]/div/div/div[2]/div');

            let dd = await page.$$(cc);

            let ee = Array.from(dd);

            for (let i = 0; i < ee.length; i++) {
                let ff = await page.evaluate((el) => el.textContent, ee[i]);

                ff = ff ? ff.trim() : "";

                if (ff === "MMK") {
                    console.log("hi")
                    await ee[i].click();
                    break;
                }
            }

            await this.delay(2);

            let xpath = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[3]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]');

            let firstItem = await page.$(xpath);

            if (firstItem) {
                let price = await page.evaluate((el) => el.textContent, firstItem);

                console.log(price);
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
}