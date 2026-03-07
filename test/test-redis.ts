import { createClient } from "redis";

async function checkRedis(): Promise<void> {
    const client = createClient({
        url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    });

    client.on("error", (err) => {
        console.error("Redis error:", err);
    });

    await client.connect();

    const key = "test";
    const value = "test";

    // set key dengan expire 60 detik
    await client.set(key, value, {
        EX: 60,
    });

    // ambil kembali untuk verifikasi
    const result = await client.get(key);

    if (result === value) {
        console.log("✅ Redis OK");
    } else {
        console.log("❌ Redis gagal");
    }

    await client.quit();
}

checkRedis().catch((err) => {
    console.error(err);
    process.exit(1);
});