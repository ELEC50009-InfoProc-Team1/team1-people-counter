import { param } from "express-validator";
import { Databases } from "~/managers/data/DatabaseManager.js";
import { RoomManager } from "~/managers/data/RoomManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";
import { defaultValidationResult } from "~/middleware/defaultValidationResult.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { IDPattern } from "~/util/nextID.js";

enum StatsLength {
    ONE_DAY = "oneDay",
    THREE_DAYS = "threeDays",
    ONE_WEEK = "oneWeek"
}

export default {
    path: "/:roomID/stats",
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

                req.params.length ||= StatsLength.ONE_DAY;

                let until = new Date().getTime();

                switch (req.params.length) {
                    case StatsLength.ONE_DAY:
                        until -= 1000 * 60 * 60 * 24;
                        break;
                    case StatsLength.THREE_DAYS:
                        until -= 1000 * 60 * 60 * 24 * 3;
                        break;
                    case StatsLength.ONE_WEEK:
                        until -= 1000 * 60 * 60 * 24 * 7;
                        break;
                    default:
                        break;
                }

                let stats = Databases.Data.operation(db =>
                    db.prepare(`
                        SELECT *
                        FROM occupancyAtTime
                        WHERE roomID = ?
                        AND timestamp > ?
                    `).all(room.id, until) as { roomID: string, occupancy: number, timestamp: number; }[]
                );

                return res.json(stats.map(x => ({
                    occupancy: x.occupancy,
                    timestamp: x.timestamp
                })));
            }
        ]
    }
} as RouteObject;
