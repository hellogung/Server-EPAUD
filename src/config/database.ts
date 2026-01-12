import { drizzle } from "drizzle-orm/node-postgres";
import { Config } from ".";
import { Pool } from "pg";

// export const db = drizzle({
//     connection: {
//         connectionString: Config.DATABASE_URL as string,
//         logger: true
//     }
// })

const pool = new Pool({
    connectionString: Config.DATABASE_URL as string,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
})

// Optional: global pool error handler
pool.on("error", (err) => {
  console.error("❌ Unexpected PG Pool Error:", err);
  process.exit(1); // fail fast
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT 1");
    console.log("✅ Database connected successfully:");
    client.release();
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
})();

// Drizzle instance using pool
export const db = drizzle(pool, {
  logger: true,
});