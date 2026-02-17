import { defineConfig } from 'drizzle-kit';
import { Config } from './src/config';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/*.schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: Config.DATABASE_URL!,
  },
});
