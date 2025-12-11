import RedisClient from "../config/redis";

(async() => {
    const redis = await RedisClient.getInstance()
    await redis.set("nama", "Agung Gumelar")

    console.log(await redis.get("nama"))

    await redis.disconnect()
})()


