import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors/AppError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing access token");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }

  if (
    req.tenant &&
    req.user.role !== "super_admin" &&
    req.user.organizationId !== req.tenant.id
  ) {
    throw new UnauthorizedError(
      "This token does not belong to this coaching institute",
    );
  }

  next();
}
