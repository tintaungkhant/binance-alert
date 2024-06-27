import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.REDIS_URL;

const client = createClient({ url });

export async function setCache(key: string, value: any) {
    await client.connect();

    await client.set(key, value);

    await client.disconnect();
}

export async function getCache(key: string) {
    await client.connect();

    let value = await client.get(key);

    await client.disconnect();

    return value;
}