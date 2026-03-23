import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/all",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {
                let organisations;

                if (req.user!.getCamera()) {
                    organisations = req.user!.getCamera()!.getVisibleOrganisations();
                } else {
                    organisations = req.user!.getVisibleOrganisations();
                }

                return res.json({
                    organisations: organisations.map(
                        x => ({
                            id: x.id,
                            name: x.name
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
