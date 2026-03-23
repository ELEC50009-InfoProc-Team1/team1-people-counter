import { AuthManager } from "~/managers/auth/AuthManager.js";
import type { RouteObject } from "~/managers/ServerManager.js";

export default {
    path: "/signup",
    priority: 0,
    methods: {
        get: [
            (_req, res, _next) => {
                return res.json(
                    AuthManager.getEnabledSignupMethods()
                );
            }
        ]
    }
} as RouteObject;
