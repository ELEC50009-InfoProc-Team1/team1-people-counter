import type { Handler } from "express";
import { GlobalPermissionManager, GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserUnauthorised } from "~/util/standardResponses.js";

export const hasPermission: (permission: GlobalPermissions) => Handler = (permission) => {
    return ((req, res, next) => {
        if (!GlobalPermissionManager.has(req.user!.id!, permission)) return UserUnauthorised(res);
        else return next();
    });
};
