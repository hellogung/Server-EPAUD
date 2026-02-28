import { Context } from "hono";
import {HTTPException} from "hono/http-exception";
import {ZodError} from "zod";

export const handleError = (c: Context, error: unknown) => {
    if (error instanceof HTTPException) {
        return c.json({ message: error.message }, error.status)
    }
    if (error instanceof ZodError) {
        const msg = error.errors.map(e => e.message).join(", ")
        return c.json({ message: msg }, 400)
    }
    return c.json({ message: "Internal server error" }, 500)
}