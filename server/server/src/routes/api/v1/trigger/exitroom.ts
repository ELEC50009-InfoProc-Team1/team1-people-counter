import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { isCamera } from "~/middleware/isCamera.js";
import { ActionSuccessful } from "~/util/standardResponses.js";

export default {
    path: "/exitroom",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            isCamera,
            (req, res, _next) => {
                req.user?.getCamera()?.triggerExit();

                return ActionSuccessful(res);
            }
        ]
    }
} as RouteObject;
