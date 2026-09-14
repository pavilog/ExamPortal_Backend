import { z } from "zod";

export const registerOrgSchema = z.object({
  organizationName: z.string().min(2).max(150),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  adminName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
