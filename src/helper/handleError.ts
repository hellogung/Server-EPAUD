// helpers/error.helper.ts

import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export function handleError(c: Context, err: unknown) {
    if (err instanceof HTTPException) {
        return c.json({ message: err.message }, err.status)
    }

    const error = err instanceof Error ? err : new Error(String(err))

    if (error.message.includes("jwt expired")) {
        return c.json({ message: "Token expired" }, 401)
    }

    return c.json({ message: error.message }, 500)
}