import Browser from "./browser";
import Scraper from "./scraper";

var locked = false;

(async () => {
    setInterval(async () => {
        if (locked) {
            return;
        }

        locked = true;

        await run();
    
        locked = false;
    }, 5000);
})();


async function run() {
    const browser = await(new Browser).create();

    if (!browser) {
        console.log("Browser not created");
        return;
    }

    const scraper = new Scraper(browser);

    await scraper.start();
};