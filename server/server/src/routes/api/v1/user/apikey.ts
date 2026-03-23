import { param } from "express-validator";
import { APIKeyAuthManager } from "~/managers/auth/APIKeyAuthManager.js";
import { GlobalPermissionManager, GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { UserUnauthorised } from "~/util/standardResponses.js";

export default {
    path: "/:userID/apikey",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            param("userID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            (req, res, next) => {
                let user = UserManager.get(req.params.userID?.toString() || "");

                if (!user) return next();

                if (user.id !== req.user!.id && !GlobalPermissionManager.has(req.user!.id!, GlobalPermissions.ADMINISTRATOR)) return UserUnauthorised(res);

                let { key } = APIKeyAuthManager.createForUser(user.id!);

                return res.json({
                    key: `${user.id}_${key}`
                });
            }
        ]
    }
} as RouteObject;
