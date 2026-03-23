import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/all";
import { APIManager } from "~/managers/APIManager";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { AllBuildingsPage } from "~/pages/building/AllBuildingsPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const organisations = await APIManager.Building.all();

    return organisations;
}

export default function AllBuildings({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "buildings",
                href: "/buildings"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.buildings,
        title: "all buildings"
    });

    return (
        <AllBuildingsPage
            buildings={loaderData}
        />
    );
}
