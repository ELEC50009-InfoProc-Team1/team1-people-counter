import { CameraManager } from "~/managers/data/CameraManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { isCamera } from "~/middleware/isCamera.js";

export default {
    path: "/me",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            isCamera,
            (req, res, next) => {
                let camera = CameraManager.getForUser(req.user!.id!);

                if (!camera) return next();

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
