import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { param } from "express-validator";
import { IDPattern } from "~/util/nextID.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { UserManager } from "~/managers/data/UserManager.js";

export default {
    path: "/:userID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("userID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
            ,
            defaultValidationResult,
            (req, res, next) => {
                let user = UserManager.get(req.params.userID?.toString() || "");

                if (!user) return next();

                return res.json({
                    name: user.name,
                    id: user.id
                });
            }
        ]
    }
} as RouteObject;
