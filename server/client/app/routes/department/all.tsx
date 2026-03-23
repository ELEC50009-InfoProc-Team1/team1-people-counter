import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/all";
import { APIManager } from "~/managers/APIManager";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { AllDepartmentsPage } from "~/pages/department/AllDepartmentsPage";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const organisations = await APIManager.Department.all();

    return organisations;
}

export default function AllDepartments({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "departments",
                href: "/departments"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.departments,
        title: "all departments"
    });

    return (
        <AllDepartmentsPage
            departments={loaderData}
        />
    );
}
