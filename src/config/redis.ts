import { createClient, RedisClientType } from "redis"
import { Config } from "."

class RedisClient {
    private static instance: RedisClientType | null = null
    private constructor() {}

    static async getInstance(): Promise<RedisClientType> {
        if(!RedisClient.instance) {
            const client = createClient({
                url: Config.REDIS_URL
            }) as RedisClientType

            client.on("error", (error) => {
                console.error("Redis Client Error: ", error)
            })

            await client.connect()

            RedisClient.instance = client
        }

        return RedisClient.instance
    }

    static async disconnect(): Promise<void> {
        if(RedisClient.instance?.isOpen){
            await RedisClient.instance?.quit()
            RedisClient.instance = null
        }
    }
}

export default RedisClient