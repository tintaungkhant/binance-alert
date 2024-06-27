import m from"puppeteer";import{createClient as S}from"redis";import*as v from"dotenv";v.config();var k=process.env.REDIS_URL,l=S({url:k});async function h(s,e){await l.connect(),await l.set(s,e),await l.disconnect()}async function y(s){await l.connect();let e=await l.get(s);return await l.disconnect(),e}var d=class{browser;async create(){let e=2,i=0;do try{i++;let t=await y("wsEndpoint");if(t)return this.browser=await m.connect({browserWSEndpoint:t}),console.log("Browser connected"),console.log("WS Endpoint: "+t),this.browser;if(!t){let o=["--autoplay-policy=user-gesture-required","--disable-background-networking","--disable-background-timer-throttling","--disable-backgrounding-occluded-windows","--disable-breakpad","--disable-client-side-phishing-detection","--disable-component-update","--disable-default-apps","--disable-dev-shm-usage","--disable-domain-reliability","--disable-extensions","--disable-features=AudioServiceOutOfProcess","--disable-hang-monitor","--disable-ipc-flooding-protection","--disable-notifications","--disable-offer-store-unmasked-wallet-cards","--disable-popup-blocking","--disable-print-preview","--disable-prompt-on-repost","--disable-renderer-backgrounding","--disable-setuid-sandbox","--disable-speech-api","--disable-sync","--hide-scrollbars","--ignore-gpu-blacklist","--metrics-recording-only","--mute-audio","--no-default-browser-check","--no-first-run","--no-pings","--no-zygote","--password-store=basic","--use-gl=swiftshader","--use-mock-keychain","--no-sandbox"];return this.browser=await m.launch({headless:!0,args:o}),t=this.browser.wsEndpoint(),await h("wsEndpoint",t),console.log("Browser created"),console.log("WS Endpoint: "+t),this.browser}}catch(t){i===e?(console.log(t),console.log("Error at starting browser")):await h("wsEndpoint","")}while(i<e)}};import*as b from"dotenv";import P from"axios";import g from"fs";b.config();var p=class{constructor(e){this.browser=e}page;async start(){try{this.sendToTelegram("hie");return}catch(e){console.log(e)}}xpath(e){return`::-p-xpath(${e})`}async delay(e){return new Promise(i=>{setTimeout(i,e*1e3)})}async sendBuyPriceAlert(e,i){await this.sendToTelegram(`Price is below threshold
Threshold: ${e}
Price: ${i}`)}async sendToTelegram(e){let t=`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;console.log(t);let o=process.env.TELEGRAM_GROUP_ID,a={chat_id:o||"",text:e};await P.get(t,{params:a}).catch(r=>{r.response&&(console.log(r.response.data),console.log(r.response.status),console.log(r.response.headers))})}async storeSiteSettings(){let e=await this.page.cookies();g.writeFileSync("site-settings/cookies.json",JSON.stringify(e,null,2));let i=await this.page.evaluate(()=>{let t={};for(let o=0;o<localStorage.length;o++){let a=localStorage.key(o);a&&(t[a]=localStorage.getItem(a))}return t});g.writeFileSync("site-settings/local_storage.json",JSON.stringify(i,null,2))}async setUpSiteSettings(){let e=g.readFileSync("site-settings/cookies.json","utf-8");e&&await this.page.setCookie(...JSON.parse(e));let i=g.readFileSync("site-settings/local_storage.json","utf-8");i&&await this.page.evaluate(t=>{for(let o in t)localStorage.setItem(o,t[o])},JSON.parse(i)),await this.page.reload(),await this.delay(2)}};var w=!1;(async()=>setInterval(async()=>{w||(w=!0,await T(),w=!1)},5e3))();async function T(){let s=await new d().create();if(!s){console.log("Browser not created");return}await new p(s).start()}
//# sourceMappingURL=start_scraper.js.map
