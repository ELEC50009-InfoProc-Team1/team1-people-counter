import { body, param } from "express-validator";
import { BuildingManager } from "~/managers/data/structure/BuildingManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";
import { DepartmentManager } from "~/managers/data/structure/DepartmentManager.js";

export default {
    path: "/:buildingID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("buildingID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let building = BuildingManager.get(req.params.buildingID!.toString());
                if (!building) return next();

                return res.json({
                    id: building.id,
                    name: building.name,
                    departmentID: building.departmentID
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_BUILDING),
            param("buildingID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("name")
                .optional()
                .matches(BuildingManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            body("departmentID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!DepartmentManager.get(value)) throw new Error("Unknown department");
                    return true;
                }),
            defaultValidationResult,
            (req, res, next) => {
                let building = BuildingManager.get(req.params.buildingID!.toString());
                if (!building) return next();

                building.name = req.body.name || building.name;
                building.departmentID = req.body.departmentID || building.departmentID;

                building.save();

                return res.json({
                    id: building.id,
                    name: building.name,
                    departmentID: building.departmentID
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_BUILDING),
            param("buildingID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let building = BuildingManager.get(req.params.buildingID!.toString());
                if (!building) return next();

                building.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
