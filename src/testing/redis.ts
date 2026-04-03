import RedisClient from "../config/redis";

(async () => {
    const redis = await RedisClient.getInstance()
    await redis.set("nama", "Agung Gumelar")

    await redis.disconnect()
})()


