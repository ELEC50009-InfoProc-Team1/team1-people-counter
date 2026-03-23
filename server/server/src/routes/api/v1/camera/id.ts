import { body, param } from "express-validator";
import { CameraManager } from "~/managers/data/CameraManager.js";
import { DoorwayManager } from "~/managers/data/DoorwayManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";
import { ActionSuccessful } from "~/util/standardResponses.js";

export default {
    path: "/:cameraID",
    priority: -2,
    methods: {
        get: [
            isAuthenticated,
            param("cameraID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let camera = CameraManager.get(req.params.cameraID!.toString());
                if (!camera) return next();

                return res.json({
                    id: camera.id,
                    userID: camera.userID,
                    name: camera.name,
                    location: camera.location
                });
            }
        ],
        patch: [
            isAuthenticated,
            hasPermission(GlobalPermissions.MODIFY_CAMERA),
            param("cameraID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            body("userID")
                .optional()
                .custom(value => {
                    if (!UserManager.get(value)) throw new Error("Unknown user");
                    return true;
                }),
            body("name")
                .optional()
                .matches(CameraManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters."),
            body("location")
                .optional()
                .custom(value => {
                    if (!DoorwayManager.get(value)) throw new Error("Unknown doorway");
                    return true;
                }),
            defaultValidationResult,
            (req, res, next) => {
                let camera = CameraManager.get(req.params.cameraID!.toString());
                if (!camera) return next();

                camera.userID = req.body.userID || camera.userID;
                camera.name = req.body.name || camera.name;
                camera.location = req.body.location || camera.location;

                camera.save();

                return res.json({
                    id: camera.id,
                    userID: camera.userID,
                    name: camera.name,
                    location: camera.location
                });
            }
        ],
        delete: [
            isAuthenticated,
            hasPermission(GlobalPermissions.DELETE_CAMERA),
            param("cameraID")
                .matches(IDPattern)
                .withMessage("ID must be between 1 and 32 digits."),
            defaultValidationResult,
            (req, res, next) => {
                let camera = CameraManager.get(req.params.cameraID!.toString());
                if (!camera) return next();

                camera.delete();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
