import { body } from "express-validator";
import { FloorManager } from "~/managers/data/structure/FloorManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { BuildingManager } from "~/managers/data/structure/BuildingManager.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_FLOOR),
            body("name")
                .matches(FloorManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            body("buildingID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!BuildingManager.get(value)) throw new Error("Unknown building");
                    return true;
                }),
            defaultValidationResult,
            (req, res, _next) => {
                let floor = FloorManager.create();
                floor.checkID();
                floor.name = req.body.name;
                floor.buildingID = req.body.buildingID;
                floor.save();

                return res.json({
                    id: floor.id,
                    name: floor.name,
                    buildingID: floor.buildingID
                });
            }
        ]
    }
} as RouteObject;
