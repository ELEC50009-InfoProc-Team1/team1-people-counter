import { Databases } from "~/managers/data/DatabaseManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/popular",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (_req, res, _next) => {
                let stat = Databases.Data.operation(db =>
                    db.prepare(`
                        WITH popularity (roomID, popularity, numEntries) AS (
                            SELECT roomID, SUM(occupancy) AS popularity, COUNT(roomID)
                            FROM occupancyAtTime
                            GROUP BY roomID
                        )

                        SELECT id, name, popularity, CAST(popularity AS REAL) / maxCapacity / numEntries AS normalisedPopularity
                        FROM rooms
                        LEFT JOIN popularity
                        ON rooms.id == popularity.roomID
                        ORDER BY normalisedPopularity DESC
                    `).all() as { id: string, name: string, popularity: number, normalisedPopularity: number; }[]
                );

                return res.json(stat);
            }
        ]
    }
} as RouteObject;
