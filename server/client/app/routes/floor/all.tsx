import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/all";
import { APIManager } from "~/managers/APIManager";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { AllFloorsPage } from "~/pages/floor/AllFloorsPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const organisations = await APIManager.Floor.all();

    return organisations;
}

export default function AllFloors({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "floors",
                href: "/floors"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.floors,
        title: "all floors"
    });

    return (
        <AllFloorsPage
            floors={loaderData}
        />
    );
}
