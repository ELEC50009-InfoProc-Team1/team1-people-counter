import type { ReactNode } from "react";
import { LoginPage } from "~/pages/auth/LoginPage";
import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/login";
import { APIManager } from "~/managers/APIManager";
import { redirect } from "react-router";

export function meta(): Route.MetaDescriptors {
    return getDefaultMeta({
        title: "log in"
    });
}

export async function clientLoader() {
    let me = await APIManager.User.me();
    if (me) return redirect("/home");
}

export default function Login(): ReactNode {
    return (
        <LoginPage />
    );
}
