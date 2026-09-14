import { Request, Response, NextFunction } from "express";
import { findOrganizationBySlug } from "../modules/tenancy/tenancy.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/AppError";

const TENANT_HEADER = "x-tenant-slug";

export const resolveTenant = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const slug = req.header(TENANT_HEADER);

    if (!slug) {
      throw new AppError(
        `Missing "${TENANT_HEADER}" header — which coaching institute is this request for?`,
        400,
      );
    }

    req.tenant = await findOrganizationBySlug(slug);
    next();
  },
);
