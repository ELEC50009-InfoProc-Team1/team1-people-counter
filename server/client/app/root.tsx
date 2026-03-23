import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import type { PropsWithChildren, ReactNode } from "react";
import { RootNode } from "./components/RootNode";

import "@fontsource-variable/outfit";
import "@fontsource/ibm-plex-mono";
import "@fontsource-variable/funnel-sans";

import "../config/i18n";
import { ErrorCatchAllHTTPPage } from "./pages/error/ErrorCatchAllHTTPPage";
import { ErrorCatchAllReactPage } from "./pages/error/ErrorCatchAllReactPage";
import { PeopleCoutnerLoading } from "./components/branding/PeopleCounter";
import { LinearProgress, Stack } from "@mui/material";

export default function App() {
    return <Outlet />;
}

export const links: Route.LinksFunction = () => [
    {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
    },
    {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
    },
    {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
    },
    {
        rel: "manifest",
        href: "/site.webmanifest"
    },
    {
        rel: "stylesheet",
        type: "text/css",
        href: "/assets/css/global.css"
    }
];

export function HydrateFallback() {
    return (
        <>
            <style>{"body {background:#05070a;color:#ffffff!important;}"}</style>
            <title>people counter</title>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap={8}
                width={1}
                height="100vh"
            >
                <PeopleCoutnerLoading />
                <LinearProgress
                    color="secondary"
                    sx={{
                        width: "250px"
                    }}
                />
            </Stack>
        </>
    );
}

export function Layout({ children }: PropsWithChildren): ReactNode {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <Meta />
                <Links />
            </head>
            <body>
                <RootNode>
                    {children}
                </RootNode>

                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    if (isRouteErrorResponse(error)) {
        return (
            <ErrorCatchAllHTTPPage
                code={error.status}
            />
        );
    } else if (error instanceof Error) {
        return (
            <ErrorCatchAllReactPage
                err={error}
            />
        );
    }
}
