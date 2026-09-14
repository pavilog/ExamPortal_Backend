import { z } from "zod";
import "dotenv/config";

// This schema must match your .env file EXACTLY.
// If you add a new variable to .env, add it here too, or it'll be ignored.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(20, "JWT_ACCESS_SECRET should be at least 20 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid or missing environment variables in .env:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
