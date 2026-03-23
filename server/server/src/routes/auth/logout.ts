import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";
import { ActionSuccessful, MalformedRequest, ServerError } from "~/util/standardResponses.js";

export default {
    path: "/logout",
    priority: 0,
    methods: {
        post: [
            isAuthenticated,
            (req, res, _next) => {
                if (!req.user?.currentSessionID) {
                    return MalformedRequest(res);
                }

                let sessions = req.user.getSessions();
                sessions.forEach(x => {
                    // clear up expired sessions
                    if ((x.expires?.getTime() || 0) < new Date().getTime()) x.delete();
                    else if (x.id == req.user?.currentSessionID) x.delete();
                });

                req.logout(err => {
                    if (err) ServerError(res);
                    return ActionSuccessful(res);
                });
            }
        ]
    }
} as RouteObject;
