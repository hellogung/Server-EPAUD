import { Hono } from 'hono'
import { serveStatic } from "hono/bun"
import { cors } from 'hono/cors';
import { HTTPException } from "hono/http-exception"
import { ZodError } from 'zod'
import appRoute from './routes';
import { requestLogger } from './middleware/logger.middleware';
import { logger } from './config/logger';

const app = new Hono()


// Give access for public directory
app.use("/public/*", serveStatic({
    root: './',
    onNotFound: (path, c) => {
        console.log(`${path} is not found, you access ${c.req.path}`)
    },
}))
// app.use('*', logger());
app.use('*', requestLogger())
app.use('*', cors());

// Health check
app.get('/', (c) => {
    return c.json({
        message: 'Hono API with Clean Architecture',
        version: '1.0.0',
        status: 'healthy'
    });
});

// Mount API routes
app.route('/api', appRoute);

// 404 handler
app.notFound((c) => {
    return c.json({ success: false, error: 'Route not found' }, 404);
});

// Error global error handling
app.onError(async (err, c) => {
    logger.error(err.message)

    if (err instanceof HTTPException) {
        c.status(err.status)
        return c.json({
            errors: err.message
        })
    } else if (err instanceof ZodError) {
        c.status(400)
        return c.json({
            errors: err.message
        })
    } else {
        c.status(500)
        return c.json({
            errors: err.message
        })
    }

})


export default app