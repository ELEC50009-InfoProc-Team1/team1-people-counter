import { AccountBalanceRounded, ApartmentRounded, DashboardRounded, ElevatorRounded, HomeRounded, PeopleRounded, RoomRounded, SensorDoorRounded, VideocamRounded } from "@mui/icons-material";
import { Box, Divider, dividerClasses, GlobalStyles, List, ListItem, ListItemButton, listItemButtonClasses, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { DashboardSidebarTabs } from "~/types/dashboardSidebar";
import { PeopleCounter } from "../branding/PeopleCounter";
import { ModeSwitcher } from "../ModeSwitcher";
import { useNavigate } from "react-router";
import useDashboardNavigation from "~/util/useDashboardNavigation";
import { SidebarProfile } from "./SidebarProfile";

export function openSidebar() {
    if (typeof window !== "undefined") {
        document.body.style.overflow = "hidden";
        document.documentElement.style.setProperty("--SideNavigation-slideIn", "1");
    }
}

export function closeSidebar() {
    if (typeof window !== "undefined") {
        document.documentElement.style.removeProperty("--SideNavigation-slideIn");
        document.body.style.removeProperty("overflow");
    }
}

export function toggleSidebar() {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const slideIn = window.getComputedStyle(document.documentElement).getPropertyValue("--SideNavigation-slideIn");
        if (slideIn) closeSidebar();
        else openSidebar();
    }
}

type SidebarLink = {
    text: string;
    link?: string;
    tab: DashboardSidebarTabs;
    icon?: ReactNode;
};

export const DashboardSidebar = (): ReactNode => {
    const { navigationContext } = useDashboardNavigation();
    const navigate = useNavigate();

    const tabs: SidebarLink[] = [
        {
            text: "home",
            link: "/home",
            tab: DashboardSidebarTabs.home,
            icon: <HomeRounded />
        },
        // {
        //     text: "users",
        //     link: "/users",
        //     tab: DashboardSidebarTabs.users,
        //     icon: <GroupRounded />
        // },
        {
            text: "organisations",
            link: "/organisations",
            tab: DashboardSidebarTabs.organisations,
            icon: <PeopleRounded />
        },
        {
            text: "departments",
            link: "/departments",
            tab: DashboardSidebarTabs.departments,
            icon: <AccountBalanceRounded />
        },
        {
            text: "buildings",
            link: "/buildings",
            tab: DashboardSidebarTabs.buildings,
            icon: <ApartmentRounded />
        },
        {
            text: "floors",
            link: "/floors",
            tab: DashboardSidebarTabs.departments,
            icon: <ElevatorRounded />
        },
        {
            text: "rooms",
            link: "/rooms",
            tab: DashboardSidebarTabs.rooms,
            icon: <RoomRounded />
        },
        // {
        //     text: "doorways",
        //     link: "/doorways",
        //     tab: DashboardSidebarTabs.doorways,
        //     icon: <SensorDoorRounded />
        // },
        {
            text: "cameras",
            link: "/cameras",
            tab: DashboardSidebarTabs.cameras,
            icon: <VideocamRounded />
        },
    ];

    return (
        <Paper
            sx={{
                position: {
                    xs: "fixed",
                    md: "sticky"
                },
                transform: {
                    xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
                    md: "none"
                },
                transition: "transform 0.4s, width 0.4s",
                zIndex: 1000,
                height: "100dvh",
                width: "var(--Sidebar-width)",
                top: 0,
                p: 0,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRight: "1px solid",
                borderColor: "divider",
                [`& > *:not(.${dividerClasses.root})`]: {
                    p: 2
                }
            }}
        >
            <GlobalStyles
                styles={theme => ({
                    ":root": {
                        "--Sidebar-width": "220px",
                        [theme.breakpoints.up("lg")]: {
                            "--Sidebar-width": "250px"
                        }
                    }
                })}
            />
            <Box
                className="Sidebar-overlay"
                sx={{
                    position: "fixed",
                    zIndex: 999,
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    opacity: "var(--SideNavigation-slideIn)",
                    backgroundColor: "var(--atom-palette-background-backdrop)",
                    transition: "opacity 0.4s",
                    transform: {
                        xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
                        lg: "translateX(-100%)"
                    }
                }}
                onClick={() => closeSidebar()}
            />
            <Stack
                justifyContent="space-between"
                alignItems="center"
                direction="row"
                sx={theme => ({
                    ml: theme.spacing(-2),
                    pb: "0!important"
                })}
            >
                <PeopleCounter noText />
                <ModeSwitcher />
            </Stack>
            <Divider />
            <Box
                sx={{
                    minHeight: 0,
                    p: "0!important",
                    overflow: "hidden auto",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5
                    }
                }}
            >
                <List
                    // size="sm"
                    sx={theme => ({
                        gap: 1,
                        p: 0,
                        "--List-nestedInsetStart": "30px",
                        "--ListItem-radius": (theme.vars || theme).spacing.toString()
                    })}
                >
                    {
                        tabs.map((x, i) => (
                            <ListItem
                                sx={{
                                    p: 0,
                                    px: 2
                                }}
                                key={i}
                            >
                                <ListItemButton
                                    selected={navigationContext?.sidebarActiveTab == x.tab}
                                    onClick={() => {
                                        navigate(x.link || `/home/${x.text}`);
                                    }}
                                >
                                    <ListItemIcon>
                                        {x.icon || <DashboardRounded />}
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: "200",
                                                fontSize: "16px"
                                            }}
                                        >
                                            {x.text}
                                        </Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        ))
                    }
                </List>
            </Box>
            <Divider />
            <SidebarProfile />
        </Paper >
    );
};
