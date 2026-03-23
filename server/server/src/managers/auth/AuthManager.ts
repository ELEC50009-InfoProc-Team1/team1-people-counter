import methods from "../../../config/auth/methods.json" with { type: "json" };

// update this with more options when they become available
export enum AuthMethod {
    Local = "local",
    Google = "google"
}

export type AuthType = "login" | "signup";

type AuthMethodConfig = {
    [K in AuthMethod]?: {
        [J in AuthType]?: {
            enabled: boolean;
        }
    }
};

export abstract class AuthManager {
    static getEnabledLoginMethods() {
        return AuthManager.#getEnabledAuthMethods("login");
    }

    static getEnabledSignupMethods() {
        return AuthManager.#getEnabledAuthMethods("signup");
    }

    static #getEnabledAuthMethods(type: AuthType): AuthMethod[] {
        let available: AuthMethod[] = [];

        (Object.keys(methods) as (keyof AuthMethodConfig)[]).forEach(x => {
            if ((methods as AuthMethodConfig)[x]?.[type]?.enabled) available.push(x);
        });

        return available;
    }
}

export abstract class MethodManager {
    // @ts-expect-error
    static get(userID: string): any {
        throw new Error("Not implemented by child class.");
    }

    // @ts-expect-error
    static createForUser(userID: string, ...other: any[]): any {
        throw new Error("Not implemented by child class.");
    }
}
