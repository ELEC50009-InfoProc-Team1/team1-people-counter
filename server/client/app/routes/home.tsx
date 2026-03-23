import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/home";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { useContext } from "react";
import { AuthGuardUserContext } from "~/components/context/AuthGuardUserContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { HomePage } from "~/pages/HomePage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta({
        title: "home - people counter"
    });
}

export default function Home({ }: Route.ComponentProps) {
    const { me } = useContext(AuthGuardUserContext)!;

    setDashboardNavigationContext({
        route: [
            {
                name: "home",
                "href": "/home"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.home,
        title: `hi ${me.name || "unnamed user"}!`
    });

    return (
        <HomePage />
    );
}
