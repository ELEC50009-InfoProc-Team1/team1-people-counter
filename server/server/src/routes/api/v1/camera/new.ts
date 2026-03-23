import { body } from "express-validator";
import { CameraManager } from "~/managers/data/CameraManager.js";
import { DoorwayManager } from "~/managers/data/DoorwayManager.js";
import { GlobalPermissions } from "~/managers/data/GlobalPermissionManager.js";
import { UserManager } from "~/managers/data/UserManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { hasPermission } from "~/middleware/hasPermission.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            hasPermission(GlobalPermissions.CREATE_CAMERA),
            body("userID")
                .custom(value => {
                    if (!UserManager.get(value)) throw new Error("Unknown user");
                    return true;
                }),
            body("name")
                .matches(CameraManager.namePattern)
                .withMessage("Name must be between 1 and 48 characters.")
                .optional(),
            body("location")
                .optional()
                .custom(value => {
                    if (!DoorwayManager.get(value)) throw new Error("Unknown doorway");
                    return true;
                }),
            defaultValidationResult,
            (req, res, _next) => {
                let camera = CameraManager.create();
                camera.checkID();
                camera.userID = req.body.userID;
                camera.name = req.body.name;
                camera.location = req.body.location;
                camera.save();

                return res.json({
                    id: camera.id,
                    userID: camera.userID,
                    name: camera.name,
                    location: camera.location
                });
            }
        ]
    }
} as RouteObject;
