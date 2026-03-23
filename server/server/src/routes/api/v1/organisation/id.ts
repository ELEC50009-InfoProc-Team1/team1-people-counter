import { body, param } from "express-validator";
import { OrganisationManager } from "~/managers/data/structure/OrganisationManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";

export default {
    path: "/:organisationID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("organisationID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let organisation = OrganisationManager.get(req.params.organisationID!.toString());
                if (!organisation) return next();

                return res.json({
                    id: organisation.id,
                    name: organisation.name,
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_ORGANISATION),
            param("organisationID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("name")
                .optional()
                .matches(OrganisationManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            defaultValidationResult,
            (req, res, next) => {
                let organisation = OrganisationManager.get(req.params.organisationID!.toString());
                if (!organisation) return next();

                organisation.name = req.body.name || organisation.name;

                organisation.save();

                return res.json({
                    id: organisation.id,
                    name: organisation.name,
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_ORGANISATION),
            param("organisationID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let organisation = OrganisationManager.get(req.params.organisationID!.toString());
                if (!organisation) return next();

                organisation.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
