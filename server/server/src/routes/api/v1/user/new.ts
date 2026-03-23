import { body } from "express-validator";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.ADMINISTRATOR),
            body("name")
                .matches(UserManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            defaultValidationResult,
            (req, res, _next) => {
                let user = UserManager.create();
                user.checkID();
                user.name = req.body.name;
                user.save();

                return res.json({
                    id: user.id,
                    name: user.name
                });
            }
        ]
    }
} as RouteObject;
