import type { Context, MiddlewareHandler } from "hono";
import { logger } from "../config/logger";

export const requestLogger = (): MiddlewareHandler => {
    return async (c: Context, next) => {
        const start = Date.now()
        await next()
        const time = Date.now() - start

        logger.info(`${c.req.method} ${c.req.path} - ${time}ms`)
    }
}