import Browser from "./browser";
import Scraper from "./scraper";
import https from "https";

var locked = false;

(async () => {
  const agent = new https.Agent({
    keepAlive: true,
  });

  setInterval(async () => {
    if (locked) {
      return;
    }

    locked = true;

    await run(agent);

    locked = false;
  }, 5000);
})();

async function run(agent: https.Agent) {
  const browser = await new Browser().create();

  if (!browser) {
    console.log("Browser not created");
    return;
  }

  const scraper = new Scraper(browser, agent);

  await scraper.start();
}
