import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, registerOrgSchema } from "../src/validators/auth.validators";

test("register organization accepts valid onboarding data", () => {
  const result = registerOrgSchema.safeParse({
    organizationName: "Pavilogs Academy",
    slug: "pavilogs-academy",
    adminName: "Admin User",
    email: "admin@example.com",
    password: "safe-password-123",
  });

  assert.equal(result.success, true);
});

test("register organization rejects invalid tenant slugs and short passwords", () => {
  const result = registerOrgSchema.safeParse({
    organizationName: "Pavilogs Academy",
    slug: "Invalid Slug",
    adminName: "Admin User",
    email: "admin@example.com",
    password: "short",
  });

  assert.equal(result.success, false);
});

test("login requires a valid email and a password", () => {
  assert.equal(
    loginSchema.safeParse({ email: "not-an-email", password: "" }).success,
    false,
  );
});
