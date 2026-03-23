import { body } from "express-validator";
import { DepartmentManager } from "~/managers/data/structure/DepartmentManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { OrganisationManager } from "~/managers/data/structure/OrganisationManager.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_DEPARTMENT),
            body("name")
                .matches(DepartmentManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            body("organisationID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!OrganisationManager.get(value)) throw new Error("Unknown organisation");
                    return true;
                }),
            defaultValidationResult,
            (req, res, _next) => {
                let department = DepartmentManager.create();
                department.checkID();
                department.name = req.body.name;
                department.organisationID = req.body.organisationID;
                department.save();

                return res.json({
                    id: department.id,
                    name: department.name,
                    organisationID: department.organisationID
                });
            }
        ]
    }
} as RouteObject;
