import { param } from "express-validator";
import { GlobalPermissionManager, GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/:userID/permissions",
    priority: 0,
    methods: {
        get: [
            isAuthenticated,
            param("userID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let user = UserManager.get(req.params.userID!.toString());
                if (!user) return next();

                let permissions: GlobalPermissions[] = [];
                for (let item in GlobalPermissions) {
                    if (isNaN(Number(item))) {
                        if (GlobalPermissionManager.exactHas(user.id!, item as GlobalPermissions)) permissions.push(item as GlobalPermissions);
                    }
                }

                return res.json({
                    permissions
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.ADMINISTRATOR),
            param("userID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let user = UserManager.get(req.params.userID!.toString());
                if (!user) return next();

                for (let item in GlobalPermissions) {
                    if (isNaN(Number(item))) {
                        if (req.body[item] === true) {
                            GlobalPermissionManager.allow(user.id!, item as GlobalPermissions);
                        } else if (req.body[item] === false) {
                            GlobalPermissionManager.forbid(user.id!, item as GlobalPermissions);
                        }
                    }
                }

                let permissions: GlobalPermissions[] = [];
                for (let item in GlobalPermissions) {
                    if (isNaN(Number(item))) {
                        if (GlobalPermissionManager.exactHas(user.id!, item as GlobalPermissions)) permissions.push(item as GlobalPermissions);
                    }
                }

                return res.json({
                    permissions
                });
            }
        ]
    }
} as RouteObject;
