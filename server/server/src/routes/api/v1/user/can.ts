import { param } from "express-validator";
import { GlobalPermissionManager, GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/:userID/can/:permission",
    priority: 0,
    methods: {
        get: [
            isAuthenticated,
            param("userID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            param("permission")
                .isWhitelisted(Object.keys(GlobalPermissions))
                .withMessage(`Must be one of the following permissions:\n${Object.keys(GlobalPermissions).join(", ")}`),
            defaultValidationResult,
            (req, res, next) => {
                let user = UserManager.get(req.params.userID!.toString());
                if (!user) return next();

                let can = GlobalPermissionManager.has(req.params.userID!.toString(), req.params.permission!.toString() as GlobalPermissions);

                res.json({
                    can
                });
            }
        ]
    }
} as RouteObject;
