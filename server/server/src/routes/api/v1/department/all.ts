import type { RouteObject } from "~/managers/ServerManager.js";
import { isAuthenticated } from "~/middleware/isAuthenticated.js";

export default {
    path: "/all",
    priority: -1,
    methods: {
        get: [
            isAuthenticated,
            (req, res, _next) => {

                let departments;

                if (req.user!.getCamera()) {
                    departments = req.user!.getCamera()!.getVisibleDepartments();
                } else {
                    departments = req.user!.getVisibleDepartments();
                }

                return res.json({
                    departments: departments.map(
                        x => ({
                            id: x.id,
                            name: x.name,
                            organisationID: x.organisationID
                        })
                    )
                });
            }
        ]
    }
} as RouteObject;
