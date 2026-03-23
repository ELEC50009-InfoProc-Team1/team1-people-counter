import { join } from "node:path";
import type { RouteObject } from "~/managers/ServerManager.js";

export default {
    path: "*all",
    priority: -1,
    methods: {
        get: [
            (req, res, next) => {
                if (req.accepts("text/html")) {
                    return res.sendFile(join(process.cwd(), "index.html"));
                } else return next();
            }
        ]
    }
} as RouteObject;
