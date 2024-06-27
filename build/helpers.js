import{createClient as c}from"redis";import*as a from"dotenv";a.config();var o=process.env.REDIS_URL,t=c({url:o});async function r(n,e){await t.connect(),await t.set(n,e),await t.disconnect()}async function s(n){await t.connect();let e=await t.get(n);return await t.disconnect(),e}export{s as getCache,r as setCache};
//# sourceMappingURL=helpers.js.map
