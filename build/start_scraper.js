// src/browser.ts
import puppeteer from "puppeteer";

// src/helpers.ts
import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();
var url = process.env.REDIS_URL;
var client = createClient({ url });
async function setCache(key, value) {
  await client.connect();
  await client.set(key, value);
  await client.disconnect();
}
async function getCache(key) {
  await client.connect();
  let value = await client.get(key);
  await client.disconnect();
  return value;
}

// src/browser.ts
var Browser = class {
  browser;
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
          console.log("WS Endpoint: " + wsEndpoint);
          return this.browser;
        }
        if (!wsEndpoint) {
          const args = [
            "--autoplay-policy=user-gesture-required",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-update",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-domain-reliability",
            "--disable-extensions",
            "--disable-features=AudioServiceOutOfProcess",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-notifications",
            "--disable-offer-store-unmasked-wallet-cards",
            "--disable-popup-blocking",
            "--disable-print-preview",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-setuid-sandbox",
            "--disable-speech-api",
            "--disable-sync",
            "--hide-scrollbars",
            "--ignore-gpu-blacklist",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-default-browser-check",
            "--no-first-run",
            "--no-pings",
            "--no-zygote",
            "--password-store=basic",
            "--use-gl=swiftshader",
            "--use-mock-keychain",
            "--no-sandbox"
          ];
          this.browser = await puppeteer.launch({
            // userDataDir: "./user_data",
            headless: true,
            args
          });
          wsEndpoint = this.browser.wsEndpoint();
          await setCache("wsEndpoint", wsEndpoint);
          console.log("Browser created");
          console.log("WS Endpoint: " + wsEndpoint);
          return this.browser;
        }
      } catch (error) {
        if (attempts === max_attempt) {
          console.log(error);
          console.log("Error at starting browser");
        } else {
          await setCache("wsEndpoint", "");
        }
      }
    } while (attempts < max_attempt);
  }
};

// src/scraper.ts
import * as dotenv2 from "dotenv";
import axios from "axios";
import fs from "fs";
dotenv2.config();
var Scraper = class {
  constructor(browser) {
    this.browser = browser;
  }
  page;
  async start() {
    try {
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 600, height: 600 });
      await this.page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED");
      console.log("Page loaded");
      await this.setUpSiteSettings();
      console.log("Selecting currency");
      await this.delay(1);
      let currency_input_xp = this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div');
      let currency_input = await this.page.$(currency_input_xp);
      if (!currency_input) {
        console.log("Currency input not found");
        await this.sendToTelegram("Currency input not found");
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
      console.log("Browser disconnected");
    } catch (error) {
      console.log(error);
    }
  }
  xpath(selector) {
    return `::-p-xpath(${selector})`;
  }
  async delay(seconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1e3);
    });
  }
  async sendBuyPriceAlert(buy_price_threshold, price) {
    await this.sendToTelegram(`Price is below threshold
Threshold: ${buy_price_threshold}
Price: ${price}`);
  }
  async sendToTelegram(text) {
    let token = process.env.TELEGRAM_BOT_TOKEN;
    let url2 = "https://api.telegram.org/bot" + token + "/sendMessage";
    console.log(url2);
    let group_id = process.env.TELEGRAM_GROUP_ID;
    text = "test";
    let params = {
      chat_id: group_id ? group_id : "",
      text
    };
    await axios.get(url2, { params });
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
      await this.page.evaluate((local_storage2) => {
        for (let key in local_storage2) {
          localStorage.setItem(key, local_storage2[key]);
        }
      }, JSON.parse(local_storage));
    }
    await this.page.reload();
    await this.delay(2);
  }
};

// src/start_scraper.ts
var locked = false;
(async () => {
  setInterval(async () => {
    if (locked) {
      return;
    }
    locked = true;
    await run();
    locked = false;
  }, 5e3);
})();
async function run() {
  const browser = await new Browser().create();
  if (!browser) {
    console.log("Browser not created");
    return;
  }
  const scraper = new Scraper(browser);
  await scraper.start();
}
