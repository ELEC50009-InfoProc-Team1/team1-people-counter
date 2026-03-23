import type { User } from "./managers/data/UserManager.ts";

declare module "express-serve-static-core" {
    export interface Request {
        user?: User;
    }
}
