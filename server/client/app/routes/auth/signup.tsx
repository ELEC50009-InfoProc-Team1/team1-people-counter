import type { ReactNode } from "react";
import { redirect } from "react-router";
import { APIManager } from "~/managers/APIManager";
import { SignUpPage } from "~/pages/auth/SignUpPage";
import { getDefaultMeta } from "~/util/defaultMeta";
import type { Route } from "./+types/signup";

export function meta(): Route.MetaDescriptors {
    return getDefaultMeta({
        title: "sign up"
    });
}

export async function clientLoader() {
    const me = await APIManager.User.me();
    if (me) return redirect("/home");
    const available = await APIManager.Auth.getAccountRegistrationOpen();
    if (!available) return redirect("/login");
}

export default function SignUp(): ReactNode {
    return (
        <SignUpPage />
    );
}
