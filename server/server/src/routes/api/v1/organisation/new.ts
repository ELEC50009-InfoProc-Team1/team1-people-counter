import { body } from "express-validator";
import { OrganisationManager } from "~/managers/data/structure/OrganisationManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
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
            hasPermission(GlobalPermissions.CREATE_ORGANISATION),
            body("name")
                .matches(OrganisationManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            defaultValidationResult,
            (req, res, _next) => {
                let organisation = OrganisationManager.create();
                organisation.checkID();
                organisation.name = req.body.name;
                organisation.save();

                return res.json({
                    id: organisation.id,
                    name: organisation.name,
                });
            }
        ]
    }
} as RouteObject;
