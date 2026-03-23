import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/all",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {
                let rooms;

                if (req.user!.getCamera()) {
                    rooms = req.user!.getCamera()!.getVisibleRooms();
                } else {
                    rooms = req.user!.getVisibleRooms();
                }

                return res.json({
                    rooms: rooms.map(
                        x => ({
                            id: x.id,
                            name: x.name,
                            floorID: x.floorID,
                            maxCapacity: x.maxCapacity,
                            currentNoOfPeople: x.currentNoOfPeople
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
