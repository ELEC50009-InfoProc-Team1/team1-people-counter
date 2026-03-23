import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/allrooms";
import { APIManager } from "~/managers/APIManager";
import { AllRoomsPage } from "~/pages/room/AllRoomsPage";
import { setDashboardNavigationContext } from "~/util/setDashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";

export function meta({ }: Route.MetaArgs) {
    return getDefaultMeta();
}

export async function clientLoader() {
    const rooms = await APIManager.Room.all();

    return rooms;
}

export default function AllRooms({ loaderData }: Route.ComponentProps) {
    setDashboardNavigationContext({
        route: [
            {
                name: "rooms",
                href: "/rooms"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.rooms,
        title: "all rooms"
    });

    return (
        <AllRoomsPage
            rooms={loaderData}
        />
    );
}
