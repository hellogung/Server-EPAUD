export const Config = {
    PORT: Number(process.env.PORT || 3000),
    ENVIRONTMENT: process.env.ENV == "development" ? true : false,
    DATABASE_URL: process.env.DATABASE_URL,
    ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY,
    REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY,
    EXPIRED_ACCESS_TOKEN: parseInt(process.env.EXPIRED_ACCESS_TOKEN as string) || 15, // Value In a Minute
    EXPIRED_REFRESH_TOKEN: parseInt(process.env.EXPIRED_REFRESH_TOKEN as string) * 60 * 24 || 7 * 6 * 24, // Value in a Day
    REDIS_URL: process.env.REDIS_URL,
    IS_PRODUCTION: process.env.ENV == "production" ? true : false,
    CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean),
}