import { body, param } from "express-validator";
import { DepartmentManager } from "~/managers/data/structure/DepartmentManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";
import { OrganisationManager } from "~/managers/data/structure/OrganisationManager.js";

export default {
    path: "/:departmentID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("departmentID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let department = DepartmentManager.get(req.params.departmentID!.toString());
                if (!department) return next();

                return res.json({
                    id: department.id,
                    name: department.name,
                    organisationID: department.organisationID
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_DEPARTMENT),
            param("departmentID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("name")
                .optional()
                .matches(DepartmentManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            body("organisationID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!OrganisationManager.get(value)) throw new Error("Unknown organisation");
                    return true;
                }),
            defaultValidationResult,
            (req, res, next) => {
                let department = DepartmentManager.get(req.params.departmentID!.toString());
                if (!department) return next();

                department.name = req.body.name || department.name;
                department.organisationID = req.body.organisationID || department.organisationID;

                department.save();

                return res.json({
                    id: department.id,
                    name: department.name,
                    organisationID: department.organisationID
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_DEPARTMENT),
            param("departmentID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let department = DepartmentManager.get(req.params.departmentID!.toString());
                if (!department) return next();

                department.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
