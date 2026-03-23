import type React from "react";
import { createContext } from "react";
import type { BuildingObject, DepartmentObject, FloorObject, OrganisationObject, RoomObject } from "~/managers/APIManager";
import type { DashboardSidebarTabs } from "~/types/dashboardSidebar";

type DashboardNavigationRouteEntry = {
    name: string;
    href: string;
};

export type DashboardNavigation = {
    route: Array<DashboardNavigationRouteEntry>;
    sidebarActiveTab: DashboardSidebarTabs;

    title: string;

    activeOrganisation?: OrganisationObject;
    activeDepartment?: DepartmentObject;
    activeBuilding?: BuildingObject;
    activeFloor?: FloorObject;
    activeRoom?: RoomObject;
};

export type DashboardNavigationContextData = {
    navigationContext: DashboardNavigation | undefined;
    setNavigationContext: React.Dispatch<React.SetStateAction<DashboardNavigation | undefined>>;
};

export const DashboardNavigationContext = createContext<DashboardNavigationContextData | undefined>(undefined);
