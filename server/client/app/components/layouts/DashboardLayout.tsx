import { useState, type ReactNode } from "react";
import { Outlet } from "react-router";
import { type DashboardNavigation, DashboardNavigationContext } from "../context/DashboardNavigationContext";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { Box } from "@mui/material";
import { DashboardSidebar } from "../navigation/DashboardSidebar";
import { DashboardHeader } from "../navigation/DashboardHeader";

export default function DashboardLayout(): ReactNode {
    // const navigate = useNavigate();
    const [navigationContext, setNavigationContext] = useState<DashboardNavigation | undefined>({
        route: [
            {
                name: "test",
                href: "/testtt"
            },
            {
                name: "test",
                href: "/login"
            }
        ],
        sidebarActiveTab: DashboardSidebarTabs.home,
        title: "i want to die"
    });

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100dvh"
            }}
        >
            <DashboardNavigationContext
                value={{
                    navigationContext,
                    setNavigationContext
                }}
            >
                <DashboardSidebar />
                <Box
                    component="main"
                    sx={{
                        pt: {
                            xs: "calc(12px + var(--Header-height))",
                            md: 3
                        },
                        pb: {
                            xs: 2,
                            sm: 2,
                            md: 3
                        },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                        height: "100dvh",
                        overflow: "auto",
                        bgcolor: "background.body"
                    }}
                >
                    <DashboardHeader />
                    <Outlet />
                </Box>
            </DashboardNavigationContext>
        </Box>
    );
}
