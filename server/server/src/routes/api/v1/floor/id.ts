import { body, param } from "express-validator";
import { FloorManager } from "~/managers/data/structure/FloorManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";
import { BuildingManager } from "~/managers/data/structure/BuildingManager.js";

export default {
    path: "/:floorID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("floorID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let floor = FloorManager.get(req.params.floorID!.toString());
                if (!floor) return next();

                return res.json({
                    id: floor.id,
                    name: floor.name,
                    buildingID: floor.buildingID
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_FLOOR),
            param("floorID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("name")
                .optional()
                .matches(FloorManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            body("buildingID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!BuildingManager.get(value)) throw new Error("Unknown building");
                    return true;
                }),
            defaultValidationResult,
            (req, res, next) => {
                let floor = FloorManager.get(req.params.floorID!.toString());
                if (!floor) return next();

                floor.name = req.body.name || floor.name;
                floor.buildingID = req.body.buildingID || floor.buildingID;

                floor.save();

                return res.json({
                    id: floor.id,
                    name: floor.name,
                    buildingID: floor.buildingID
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_FLOOR),
            param("floorID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let floor = FloorManager.get(req.params.floorID!.toString());
                if (!floor) return next();

                floor.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
