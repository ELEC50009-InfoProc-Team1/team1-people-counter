import type { RouteObject } from "~/managers/ServerManager.js";
import { ResourceNotFound } from "~/util/standardResponses.js";

export default {
    path: "*all",
    priority: -100,
    methods: {
        get: [
            (_req, res, _next) => {
                return ResourceNotFound(res);
            }
        ]
    }
} as RouteObject;
