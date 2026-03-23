import { body, param } from "express-validator";
import { DoorwayManager } from "~/managers/data/DoorwayManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";
import { RoomManager } from "~/managers/data/RoomManager.js";

export default {
    path: "/:doorwayID",
    priority: 0,
    methods: {
        get: [
            isAuthenticated,
            param("doorwayID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let doorway = DoorwayManager.get(req.params.doorwayID!.toString());
                if (!doorway) return next();

                return res.json({
                    id: doorway.id,
                    inRoomID: doorway.inRoomID,
                    outRoomID: doorway.outRoomID
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_DOORWAY),
            param("doorwayID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("inRoomID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!RoomManager.get(value)) throw new Error("Unknown room");
                    return true;
                }),
            body("outRoomID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!RoomManager.get(value)) throw new Error("Unknown room");
                    return true;
                }),
            defaultValidationResult,
            (req, res, next) => {
                let doorway = DoorwayManager.get(req.params.doorwayID!.toString());
                if (!doorway) return next();

                doorway.inRoomID = req.body.inRoomID || doorway.inRoomID;
                doorway.outRoomID = req.body.outRoomID || doorway.outRoomID;

                doorway.save();

                return res.json({
                    id: doorway.id,
                    inRoomID: doorway.inRoomID,
                    outRoomID: doorway.outRoomID
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_DOORWAY),
            param("doorwayID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let doorway = DoorwayManager.get(req.params.doorwayID!.toString());
                if (!doorway) return next();

                doorway.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
