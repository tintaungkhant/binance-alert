import*as p from"dotenv";import h from"axios";import r from"fs";p.config();var c=class{constructor(e){this.browser=e}page;async start(){try{this.page=await this.browser.newPage(),await this.page.setViewport({width:600,height:600}),await this.page.goto("https://p2p.binance.com/trade/all-payments/USDT?fiat=AED"),console.log("Page loaded"),await this.setUpSiteSettings(),console.log("Selecting currency"),await this.delay(1);let e=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div'),t=await this.page.$(e);if(!t){console.log("Currency input not found"),await this.sendToTelegram("Currency input not found");return}console.log("Clicking over currency input"),await t.click(),await this.delay(1),console.log("Searching currency");let o=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[1]/div/input'),i=await this.page.$(o);if(!i){console.log("Currency search input not found"),await this.sendToTelegram("Currency search input not found");return}console.log("Typing MMK"),await i.type("MMK",{delay:200}),await this.delay(1),console.log("Clicking currency button");let a=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[1]/div/div[2]/div[2]/div/div[2]/div/div/div[2]/div/div'),d=await this.page.$(a);if(!d){console.log("Currency button not found"),await this.sendToTelegram("Currency search input not found");return}await d.click(),console.log("Currency selected"),await this.delay(2),console.log("Selecting first item");let u=this.xpath('//*[@id="__APP"]/div/div[2]/main/div[2]/div[3]/div/div[1]/div[1]/div[2]/div[1]/div/div[1]'),g=await this.page.$(u);if(!g){console.log("First item not found"),await this.sendToTelegram("Currency search input not found");return}console.log("Selected first item");let s=await this.page.evaluate(l=>l.textContent,g);if(s){let l=/[^0-9]/g;s=s.replace(l,"");let n=process.env.BUY_PRICE_THRESHOLD;n=n||"0",console.info("Price threshold "+n),console.info("Price: "+s),s<=n&&await this.sendBuyPriceAlert(n,s)}await this.page.close(),await this.browser.disconnect(),console.log("Browser disconnected")}catch(e){console.log(e)}}xpath(e){return`::-p-xpath(${e})`}async delay(e){return new Promise(t=>{setTimeout(t,e*1e3)})}async sendBuyPriceAlert(e,t){await this.sendToTelegram(`Price is below threshold
Threshold: ${e}
Price: ${t}`)}async sendToTelegram(e){let o="https://api.telegram.org/bot"+process.env.TELEGRAM_BOT_TOKEN+"/sendMessage";console.log(o);let i=process.env.TELEGRAM_GROUP_ID,a={chat_id:i||"",text:e};await h.get(o,{params:a})}async storeSiteSettings(){let e=await this.page.cookies();r.writeFileSync("site-settings/cookies.json",JSON.stringify(e,null,2));let t=await this.page.evaluate(()=>{let o={};for(let i=0;i<localStorage.length;i++){let a=localStorage.key(i);a&&(o[a]=localStorage.getItem(a))}return o});r.writeFileSync("site-settings/local_storage.json",JSON.stringify(t,null,2))}async setUpSiteSettings(){let e=r.readFileSync("site-settings/cookies.json","utf-8");e&&await this.page.setCookie(...JSON.parse(e));let t=r.readFileSync("site-settings/local_storage.json","utf-8");t&&await this.page.evaluate(o=>{for(let i in o)localStorage.setItem(i,o[i])},JSON.parse(t)),await this.page.reload(),await this.delay(2)}};export{c as default};
//# sourceMappingURL=scraper.js.map
