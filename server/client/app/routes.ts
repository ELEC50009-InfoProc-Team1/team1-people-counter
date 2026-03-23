import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // landing
    index("routes/index.tsx"),

    // auth
    layout("components/layouts/AuthPageLayout.tsx", [
        route("login", "routes/auth/login.tsx"),
        route("signup", "routes/auth/signup.tsx")
    ]),

    // requires authentication
    layout("components/layouts/AuthGuardLayout.tsx", [
        route("room/:roomID", "routes/room/data.tsx"),

        layout("components/layouts/DashboardLayout.tsx", [
            route("organisations", "routes/organisation/all.tsx"),
            route("departments", "routes/department/all.tsx"),
            route("buildings", "routes/building/all.tsx"),
            route("floors", "routes/floor/all.tsx"),
            route("rooms", "routes/room/allrooms.tsx"),
            route("cameras", "routes/camera/all.tsx"),

            route("home", "routes/home.tsx")
        ]),
    ])
] satisfies RouteConfig;
