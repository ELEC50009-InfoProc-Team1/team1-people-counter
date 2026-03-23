import { useEffect } from "react";
import { type DashboardNavigation } from "~/components/context/DashboardNavigationContext";
import useDashboardNavigation from "./useDashboardNavigation";

export const setDashboardNavigationContext = (props: DashboardNavigation, watch: any[] = []) => {
    const { setNavigationContext } = useDashboardNavigation();

    useEffect(() => {
        setNavigationContext(props);
    }, watch);
};
