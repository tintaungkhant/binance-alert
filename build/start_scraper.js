import m from"puppeteer";import{createClient as S}from"redis";import*as v from"dotenv";v.config();var k=process.env.REDIS_URL,n=S({url:k});async function u(s,e){await n.connect(),await n.set(s,e),await n.disconnect()}async function y(s){await n.connect();let e=await n.get(s);return await n.disconnect(),e}var l=class{browser;async create(){let e=2,i=0;do try{i++;let t=await y("wsEndpoint");if(t)return this.browser=await m.connect({browserWSEndpoint:t}),console.log("Browser connected"),console.log("WS Endpoint: "+t),this.browser;if(!t){let o=["--autoplay-policy=user-gesture-required","--disable-background-networking","--disable-background-timer-throttling","--disable-backgrounding-occluded-windows","--disable-breakpad","--disable-client-side-phishing-detection","--disable-component-update","--disable-default-apps","--disable-dev-shm-usage","--disable-domain-reliability","--disable-extensions","--disable-features=AudioServiceOutOfProcess","--disable-hang-monitor","--disable-ipc-flooding-protection","--disable-notifications","--disable-offer-store-unmasked-wallet-cards","--disable-popup-blocking","--disable-print-preview","--disable-prompt-on-repost","--disable-renderer-backgrounding","--disable-setuid-sandbox","--disable-speech-api","--disable-sync","--hide-scrollbars","--ignore-gpu-blacklist","--metrics-recording-only","--mute-audio","--no-default-browser-check","--no-first-run","--no-pings","--no-zygote","--password-store=basic","--use-gl=swiftshader","--use-mock-keychain","--no-sandbox"];return this.browser=await m.launch({headless:!0,args:o}),t=this.browser.wsEndpoint(),await u("wsEndpoint",t),console.log("Browser created"),console.log("WS Endpoint: "+t),this.browser}}catch(t){i===e?(console.log(t),console.log("Error at starting browser")):await u("wsEndpoint","")}while(i<e)}};import*as b from"dotenv";import P from"axios";import p from"fs";b.config();var d=class{constructor(e){this.browser=e}page;async start(){try{this.page=await this.browser.newPage(),await this.page.setViewport({width:600,height:600}),await this.page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED"),console.log("Page loaded"),await this.setUpSiteSettings(),console.log("Selecting currency"),await this.delay(1);let e=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div'),i=await this.page.$(e);if(!i){console.log("Currency input not found"),await this.sendToTelegram("Currency input not found");return}console.log("Clicking over currency input"),await i.click(),await this.delay(1),console.log("Searching currency");let t=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]/div/input'),o=await this.page.$(t);if(!o){console.log("Currency search input not found"),await this.sendToTelegram("Currency search input not found");return}console.log("Typing MMK"),await o.type("MMK",{delay:200}),await this.delay(1),console.log("Clicking currency button");let c=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div'),h=await this.page.$(c);if(!h){console.log("Currency button not found"),await this.sendToTelegram("Currency search input not found");return}await h.click(),console.log("Currency selected"),await this.delay(2),console.log("Selecting first item");let _=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[3]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]'),f=await this.page.$(_);if(!f){console.log("First item not found"),await this.sendToTelegram("Currency search input not found");return}console.log("Selected first item");let a=await this.page.evaluate(g=>g.textContent,f);if(a){let g=/[^0-9]/g;a=a.replace(g,"");let r=process.env.BUY_PRICE_THRESHOLD;r=r||"0",console.info("Price threshold "+r),console.info("Price: "+a),a<=r&&await this.sendBuyPriceAlert(r,a)}await this.page.close(),await this.browser.disconnect(),console.log("Browser disconnected")}catch(e){console.log(e)}}xpath(e){return`::-p-xpath(${e})`}async delay(e){return new Promise(i=>{setTimeout(i,e*1e3)})}async sendBuyPriceAlert(e,i){await this.sendToTelegram(`Price is below threshold
Threshold: ${e}
Price: ${i}`)}async sendToTelegram(e){let t=`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,o={chat_id:process.env.TELEGRAM_GROUP_ID,text:e};await P.get(t,{params:o})}async storeSiteSettings(){let e=await this.page.cookies();p.writeFileSync("site-settings/cookies.json",JSON.stringify(e,null,2));let i=await this.page.evaluate(()=>{let t={};for(let o=0;o<localStorage.length;o++){let c=localStorage.key(o);c&&(t[c]=localStorage.getItem(c))}return t});p.writeFileSync("site-settings/local_storage.json",JSON.stringify(i,null,2))}async setUpSiteSettings(){let e=p.readFileSync("site-settings/cookies.json","utf-8");e&&await this.page.setCookie(...JSON.parse(e));let i=p.readFileSync("site-settings/local_storage.json","utf-8");i&&await this.page.evaluate(t=>{for(let o in t)localStorage.setItem(o,t[o])},JSON.parse(i)),await this.page.reload(),await this.delay(2)}};var w=!1;(async()=>setInterval(async()=>{w||(w=!0,await x(),w=!1)},5e3))();async function x(){let s=await new l().create();if(!s){console.log("Browser not created");return}await new d(s).start()}
//# sourceMappingURL=start_scraper.js.map
