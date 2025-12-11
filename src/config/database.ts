import { drizzle } from "drizzle-orm/node-postgres";
import { Config } from ".";

export const db = drizzle({
    connection: {
        connectionString: Config.DATABASE_URL as string,
        logger: true
    }
})