import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/all";
import { APIManager } from "~/managers/APIManager";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { AllOrganisationsPage } from "~/pages/organisation/AllOrganisationsPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const departments = await APIManager.Organisation.all();

    return departments;
}

export default function AllDepartments({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "organisations",
                href: "/organisations"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.organisations,
        title: "all organisations"
    });

    return (
        <AllOrganisationsPage
            organisations={loaderData}
        />
    );
}
