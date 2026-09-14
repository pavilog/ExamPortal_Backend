import { Organization } from "../modules/tenancy/tenancy.service";
import { AccessTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      tenant?: Organization;
      user?: AccessTokenPayload;
    }
  }
}

export {};
