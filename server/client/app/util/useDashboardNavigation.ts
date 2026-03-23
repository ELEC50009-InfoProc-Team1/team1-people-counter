import { useContext } from "react";
import { DashboardNavigationContext, type DashboardNavigationContextData } from "../components/context/DashboardNavigationContext";

export default function useDashboardNavigation(): DashboardNavigationContextData {
    const context = useContext(DashboardNavigationContext);
    if (!context) {
        throw new Error("Dashboard navigation context is not yet populated.");
    }

    return context;
}
