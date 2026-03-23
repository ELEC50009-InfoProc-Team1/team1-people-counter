import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/all",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {
                let cameras;

                if (req.user!.getCamera()) {
                    cameras = req.user!.getCamera()!.getVisibleCameras();
                } else {
                    cameras = req.user!.getVisibleCameras();
                }

                return res.json({
                    cameras: cameras.map(
                        x => ({
                            id: x.id,
                            userID: x.userID,
                            name: x.name,
                            location: x.location
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
