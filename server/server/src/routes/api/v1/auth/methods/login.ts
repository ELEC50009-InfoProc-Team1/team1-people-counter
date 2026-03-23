import { AuthManager } from "~/managers/auth/AuthManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";

export default {
    path: "/login",
    priority: 0,
    methods: {
        get: [
            (_req, res, _next) => {
                return res.json(
                    AuthManager.getEnabledLoginMethods()
                );
            }
        ]
    }
} as RouteObject;
