import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import config from "../../config/config.json";

export class LocalAuthManager {
    static usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    static passwordPattern = /^[a-zA-Z0-9\._+\-/\\*=!"£$%^&*()\[\]{}:;@#~&<>? ]{12,255}$/;

    static async login(username: string, password: string): Promise<boolean> {
        let res = await AuthManager.request({
            method: "post",
            url: "/login/local",
            data: {
                username,
                password
            }
        });

        if (res) return true;
        return false;
    }

    static async signup(username: string, password: string): Promise<boolean> {
        let res = await AuthManager.request({
            method: "post",
            url: "/signup/local",
            data: {
                username,
                password
            }
        });

        if (res) return true;
        return false;
    }
}

export class AuthManager {
    static #axios?: AxiosInstance;
    static #initialised = false;

    /**
     * Initialise the authentication manager.
     */
    static init() {
        AuthManager.#axios = axios.create({
            baseURL: config.auth.location,
            allowAbsoluteUrls: false,
            timeout: 10000,
            headers: {
                Accept: "application/json"
            },
            withCredentials: true
        });

        AuthManager.#initialised = true;
    }

    static async request(data: AxiosRequestConfig<any>): Promise<AxiosResponse<any, any> | undefined> {
        if (!AuthManager.#initialised) AuthManager.init();
        return await AuthManager.#axios?.request(data);
    }

    /**
     * Log the user out.
     * @returns Whether the logout attempt was successful.
     */
    static async logout(): Promise<boolean> {
        try {
            let res = await AuthManager.request({
                method: "post",
                url: "/logout"
            });

            return res?.status === 200;
        } catch {
            return false;
        }
    }
}
