import passport from "passport";
import { AuthManager, AuthMethod, type AuthType } from "~/managers/auth/AuthManager.js";
import type { RouteObjectWithErr } from "~/managers/ServerManager.js";
import { isNotAuthenticated } from "~/middleware/isNotAuthenticated.js";
import { ActionSuccessful, ResourceNotFound } from "~/util/standardResponses.js";

export default {
    path: "/local",
    priority: 0,
    methods: {
        post: [
            isNotAuthenticated,
            (req, res, next) => {
                if (!AuthManager.getEnabledLoginMethods().includes(AuthMethod.Local)) return ResourceNotFound(res);

                const attemptType: AuthType = "login";
                const state = Buffer.from(
                    JSON.stringify(
                        {
                            attemptType
                        }
                    )
                ).toString("base64");

                let failRedirect = "/login?error=local";

                req.params.state = state;
                passport.authenticate("local", {
                    failureRedirect: failRedirect,
                    failWithError: true
                })(req, res, next);
            },
            (_req, res, _next) => {
                ActionSuccessful(res);
            },
            (_err, _req, res, _next) => {
                res.status(400);
                return res.json({
                    code: 400,
                    message: "Incorrect username or password."
                });
            }
        ]
    }
} as RouteObjectWithErr;
