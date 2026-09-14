import { Request, Response } from "express";
import {
  registerOrgSchema,
  loginSchema,
} from "../../validators/auth.validators";
import { registerOrganization, loginToTenant } from "./auth.service";
import { AppError } from "../../errors/AppError";

export async function registerOrgHandler(req: Request, res: Response) {
  const input = registerOrgSchema.parse(req.body);
  const result = await registerOrganization(input);

  res.status(201).json({
    message: "Coaching institute registered successfully",
    data: result,
  });
}

export async function loginHandler(req: Request, res: Response) {
  if (!req.tenant) {
    throw new AppError(
      "Tenant could not be resolved for this login request",
      400,
    );
  }

  const input = loginSchema.parse(req.body);
  const result = await loginToTenant(input, req.tenant.id);

  res.status(200).json({
    message: "Login successful",
    data: result,
  });
}
