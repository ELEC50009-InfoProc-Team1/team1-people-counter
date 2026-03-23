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
                    cameras = req.user!.getCamera()!.getVisibleBuildings();
                } else {
                    cameras = req.user!.getVisibleBuildings();
                }

                return res.json({
                    buildings: cameras.map(
                        x => ({
                            id: x.id,
                            name: x.name,
                            departmentID: x.departmentID
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
