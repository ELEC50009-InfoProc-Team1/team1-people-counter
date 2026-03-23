import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/all";
import { APIManager } from "~/managers/APIManager";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { AllCamerasPage } from "~/pages/camera/AllCamerasPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const organisations = await APIManager.Camera.all();

    return organisations;
}

export default function AllCameras({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "cameras",
                href: "/cameras"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.cameras,
        title: "all cameras"
    });

    return (
        <AllCamerasPage
            cameras={loaderData}
        />
    );
}
