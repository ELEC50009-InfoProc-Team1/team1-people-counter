import { body } from "express-validator";
import { BuildingManager } from "~/managers/data/structure/BuildingManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { DepartmentManager } from "~/managers/data/structure/DepartmentManager.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_BUILDING),
            body("name")
                .matches(BuildingManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            body("departmentID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!DepartmentManager.get(value)) throw new Error("Unknown department");
                    return true;
                }),
            defaultValidationResult,
            (req, res, _next) => {
                let building = BuildingManager.create();
                building.checkID();
                building.name = req.body.name;
                building.departmentID = req.body.departmentID;
                building.save();

                return res.json({
                    id: building.id,
                    name: building.name,
                    departmentID: building.departmentID
                });
            }
        ]
    }
} as RouteObject;
