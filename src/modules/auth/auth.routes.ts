import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { resolveTenant } from "../../middleware/tenant.middleware";
import { registerOrgHandler, loginHandler } from "./auth.controller";

const router = Router();

router.post("/register-org", asyncHandler(registerOrgHandler));
router.post("/login", resolveTenant, asyncHandler(loginHandler));

export default router;
