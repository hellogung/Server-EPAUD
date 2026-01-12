import { createClient, RedisClientType } from "redis";
import { Config } from ".";

class RedisClient {
    private static instance: RedisClientType | null = null;
    private constructor() { }

    static async getInstance(): Promise<RedisClientType> {
        if (!RedisClient.instance) {
            const client: RedisClientType = createClient({
                url: Config.REDIS_URL,
            });

            client.on("connect", () => {
                console.log("🔌 Redis connecting...");
            });

            client.on("ready", () => {
                console.log("✅ Redis connected successfully");
            });

            client.on("error", (error: Error) => {
                console.error("❌ Redis Client Error:", error);
            });

            client.on("end", () => {
                console.warn("⚠️ Redis connection closed");
            });

            try {
                await client.connect();
                RedisClient.instance = client;
            } catch (error) {
                console.error("❌ Failed to connect to Redis:", error);
                process.exit(1); // fail fast
            }
        }

        return RedisClient.instance;
    }

    static async disconnect(): Promise<void> {
        if (RedisClient.instance?.isOpen) {
            await RedisClient.instance.quit();
            RedisClient.instance = null;
            console.log("🛑 Redis disconnected");
        }
    }
}

export default RedisClient;
