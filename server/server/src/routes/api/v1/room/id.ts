import { body, param } from "express-validator";
import { RoomManager } from "~/managers/data/RoomManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";
import { FloorManager } from "~/managers/data/structure/FloorManager.js";

export default {
    path: "/:roomID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("roomID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let room = RoomManager.get(req.params.roomID!.toString());
                if (!room) return next();

                return res.json({
                    id: room.id,
                    name: room.name,
                    floorID: room.floorID,
                    maxCapacity: room.maxCapacity,
                    currentNoOfPeople: room.currentNoOfPeople
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_ROOM),
            param("roomID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("name")
                .optional()
                .matches(RoomManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
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
            (req, res, next) => {
                let room = RoomManager.get(req.params.roomID!.toString());
                if (!room) return next();

                room.name = req.body.name || room.name;
                room.floorID = req.body.floorID || room.floorID;
                room.maxCapacity = req.body.maxCapacity || req.body.maxCapacity === 0 ? parseInt(req.body.maxCapacity) : room.maxCapacity;
                room.currentNoOfPeople = req.body.currentNoOfPeople || req.body.currentNoOfPeople === 0 ? parseInt(req.body.currentNoOfPeople) : room.currentNoOfPeople;

                room.save();

                return res.json({
                    id: room.id,
                    name: room.name,
                    floorID: room.floorID,
                    maxCapacity: room.maxCapacity,
                    currentNoOfPeople: room.currentNoOfPeople
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_ROOM),
            param("roomID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let room = RoomManager.get(req.params.roomID!.toString());
                if (!room) return next();

                room.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
