import { body } from "express-validator";
import { DoorwayManager } from "~/managers/data/DoorwayManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { RoomManager } from "~/managers/data/RoomManager.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_DOORWAY),
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
            (req, res, _next) => {
                let doorway = DoorwayManager.create();
                doorway.checkID();
                doorway.inRoomID = req.body.inRoomID;
                doorway.outRoomID = req.body.outRoomID;
                doorway.save();

                return res.json({
                    id: doorway.id,
                    inRoomID: doorway.inRoomID,
                    outRoomID: doorway.outRoomID
                });
            }
        ]
    }
} as RouteObject;
