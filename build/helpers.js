import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();
const url = process.env.REDIS_URL;
const client = createClient({ url });
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
export {
  getCache,
  setCache
};
//# sourceMappingURL=helpers.js.map
