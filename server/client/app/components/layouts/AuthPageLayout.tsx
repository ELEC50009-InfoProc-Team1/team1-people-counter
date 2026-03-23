import type { ReactNode } from "react";
import { AuthPageStyle } from "../auth/AuthPageStyle";
import { Outlet } from "react-router";

export default function AuthPageLayout(): ReactNode {
    return (
        <AuthPageStyle>
            <Outlet />
        </AuthPageStyle>
    );
}
