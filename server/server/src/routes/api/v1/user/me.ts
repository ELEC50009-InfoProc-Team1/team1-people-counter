import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/me",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {
                res.json({
                    id: req.user?.id,
                    name: req.user?.name
                });
            }
        ]
    }
} as RouteObject;
