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

// src/start_browser.ts
(async function() {
  const browser = new Browser();
  await browser.create();
})();
