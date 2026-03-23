import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/all",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {
                let floors;

                if (req.user!.getCamera()) {
                    floors = req.user!.getCamera()!.getVisibleFloors();
                } else {
                    floors = req.user!.getVisibleFloors();
                }

                return res.json({
                    floors: floors.map(
                        x => ({
                            id: x.id,
                            name: x.name,
                            buildingID: x.buildingID
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
