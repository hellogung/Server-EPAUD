// helpers/error.helper.ts

import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export function handleError(c: Context, err: unknown) {
    if (err instanceof ZodError) {
        return c.json({
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: formatZodMessage(issue),
            }))
        }, 422)
    }

    if (err instanceof HTTPException) {
        return c.json({ message: err.message }, err.status)
    }

    const error = err instanceof Error ? err : new Error(String(err))

    if (error.message.includes("jwt expired")) {
        return c.json({ message: "Token expired" }, 401)
    }

    return c.json({ message: error.message }, 500)
}

function formatZodMessage(issue: ZodError["issues"][number]): string {
    if (issue.code === "invalid_value") {
        const values = (issue as any).values as string[]
        return `Must be one of: ${values.join("/")}`
    }

    return issue.message
}