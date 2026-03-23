import type { Enum } from "./enum";

export const DashboardSidebarTabs = {
    home: 0,
    // users: 1,
    organisations: 1,
    departments: 2,
    buildings: 3,
    floors: 4,
    rooms: 5,
    // doorways: 7,
    cameras: 6
};

export type DashboardSidebarTabs = Enum<typeof DashboardSidebarTabs>;
