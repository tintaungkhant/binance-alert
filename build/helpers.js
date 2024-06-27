import{createClient as e}from"redis";var t=e();async function i(n,a){await t.connect(),await t.set(n,a),await t.disconnect()}async function o(n){await t.connect();let a=await t.get(n);return await t.disconnect(),a}export{o as getCache,i as setCache};
//# sourceMappingURL=helpers.js.map
