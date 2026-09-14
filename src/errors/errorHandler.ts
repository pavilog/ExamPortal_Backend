import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "Internal server error",
    ...(env.NODE_ENV !== "production" && {
      detail: err instanceof Error ? err.message : String(err),
    }),
  });
}
