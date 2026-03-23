import { body } from "express-validator";
import { RoomManager } from "~/managers/data/RoomManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { FloorManager } from "~/managers/data/structure/FloorManager.js";
import { IDPattern } from "~/util/nextID.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_ROOM),
            body("name")
                .matches(RoomManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            body("floorID")
                .optional()
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits.")
                .custom(value => {
                    if (!FloorManager.get(value)) throw new Error("Unknown floor");
                    return true;
                }),
            body("maxCapacity")
                .optional()
                .isInt({ gt: -1 })
                .withMessage("Max capacity of room must be a positive integer."),
            body("currentNoOfPeople")
                .optional()
                .isInt({ gt: -1 })
                .withMessage("Max capacity of room must be a positive integer."),
            defaultValidationResult,
            (req, res, _next) => {
                let room = RoomManager.create();
                room.checkID();
                room.name = req.body.name;
                room.floorID = req.body.floorID;
                room.maxCapacity = req.body.maxCapacity || 0;
                room.currentNoOfPeople = req.body.currentNoOfPeople || 0;
                room.save();

                return res.json({
                    id: room.id,
                    name: room.name,
                    floorID: room.floorID,
                    maxCapacity: room.maxCapacity,
                    currentNoOfPeople: room.currentNoOfPeople
                });
            }
        ]
    }
} as RouteObject;
