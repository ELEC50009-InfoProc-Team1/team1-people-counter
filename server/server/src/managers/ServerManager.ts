import express from "express";
import headerSettings from "../../config/headers.json" with { type: "json" };
import meta from "../../config/meta.json" with { type: "json" };
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join } from "node:path";

import LoggingManager from "./LoggingManager.js";
const { debug, info, warn, error, critical } = LoggingManager;

import http from "node:http";
import https from "node:https";

export type RouteHandlerFunction = express.RequestHandler;
export type RouteHandler = RouteHandlerFunction | RouteHandlerFunction[] | undefined;
export type RouteHandlerWithErr = express.ErrorRequestHandler | [...express.RequestHandler[], express.ErrorRequestHandler] | undefined;
export type RouteMethodsObject<T> = {
    checkout?: T;
    copy?: T;
    delete?: T;
    get?: T;
    head?: T;
    lock?: T;
    merge?: T;
    mkactivity?: T;
    mkcol?: T;
    move?: T;
    "m-search"?: T;
    notify?: T;
    options?: T;
    patch?: T;
    post?: T;
    purge?: T;
    put?: T;
    report?: T;
    search?: T;
    subscribe?: T;
    trace?: T;
    unlock?: T;
    unsubscribe?: T;
    all?: T;
};
export type RouteRequestType = keyof RouteMethodsObject<RouteHandler>;
export interface RouteObject {
    path: string;
    priority?: number;
    methods: RouteMethodsObject<RouteHandler>;
};
export interface RouteObjectWithErr extends Omit<RouteObject, "methods"> {
    methods: RouteMethodsObject<RouteHandlerWithErr>;
};

type ProcessingRouteObject = RouteObject & Record<"validMethods", RouteRequestType[]> & Record<"filename", string>;

export default class ServerManager {
    static #port: number;
    static #routeDirectory: string | undefined;
    static #publicDirectories: string[];
    static #sslDirectory: string;

    static #server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | https.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    static app: express.Express;

    static disableHTTPS = false;

    /**
     * Initialise the ServerManager.
     * @param port The port to use.
     */
    static init(port: number): void {
        ServerManager.#routeDirectory = undefined;
        ServerManager.#publicDirectories = [];
        ServerManager.#port = port;

        ServerManager.app = express();
    }

    /**
     * Setup static file serving.
     * @param dir The directory to use as a public directory.
     * @param router The router to load the public directory onto. Defaults to the main app.
     * @returns A reference to the ServerManager class.
     */
    static #loadStatics(dir?: string, router?: express.Router): ServerManager {
        for (const search of dir?.length ? dir : dir ? [dir] : this.#publicDirectories) {
            (router ? router : ServerManager.app).use(express.static(search));
        }

        return ServerManager;
    }

    /**
     * Set the ServerManager up from its current state.
     */
    static async setupFromState(): Promise<void> {
        if (headerSettings.disable?.length) {
            for (const header of headerSettings.disable) {
                ServerManager.app.disable(header);
            }
        }

        ServerManager.#loadStatics();
        await ServerManager.#loadRoutes();
    }

    /**
     * Setup routes from a folder.
     * @param routeDir The directory to scan for routes in.
     * @param router The router to attach the routes to.
     * @returns A reference to the ServerManager class.
     */
    static async #loadRoutes(routeDir?: string, router?: express.Router | express.Express): Promise<ServerManager> {
        let routeScanDirectory = routeDir || this.#routeDirectory;
        if (!routeScanDirectory) throw new Error("No route directory to scan.");

        debug(`Scanning ${routeScanDirectory} for routes...`);

        // get contents of folder
        let existingRouteThings = readdirSync(routeScanDirectory).map(x => join(routeScanDirectory, x));

        let routePriorityAbove0: ProcessingRouteObject[] = [];
        let priority0Folders = existingRouteThings.filter(x => statSync(x).isDirectory());
        let routePriority0: ProcessingRouteObject[] = [];
        let routePriorityBelow0: ProcessingRouteObject[] = [];

        // find js files in folder
        let existingRouteFiles = existingRouteThings.filter(x => !statSync(x).isDirectory() && x.split(".").pop() == "js");

        debug(`${existingRouteFiles.length} file${existingRouteFiles.length != 1 ? "s" : ""} found.`);
        debug(`${priority0Folders.length} folder${priority0Folders.length != 1 ? "s" : ""} found.`);

        for (const file of existingRouteFiles) {
            debug(`Processing ${file}...`);
            let route: ProcessingRouteObject;

            try {
                let intermediate = await import(file);
                route = intermediate.default;
            } catch (e: any) {
                // skip file
                error(`Error while loading ${file}:`, e);
                continue;
            }

            // check for path
            if (!route.path) {
                warn(`${file} does not have a path and so will be ignored.`);
                continue;
            }

            // check for priority
            if (!route.priority) route.priority = 0;

            // check for handlers
            let validMethods = Object.keys(route.methods).filter(x => {
                return [
                    "checkout",
                    "copy",
                    "delete",
                    "get",
                    "head",
                    "lock",
                    "merge",
                    "mkactivity",
                    "mkcol",
                    "move",
                    "m-search",
                    "notify",
                    "options",
                    "patch",
                    "post",
                    "purge",
                    "put",
                    "report",
                    "search",
                    "subscribe",
                    "trace",
                    "unlock",
                    "unsubscribe",
                    "all"
                ].includes(x);
            });
            if (!validMethods.length) {
                warn(`${file} does not have any method functions and so will be ignored.`);
            }

            // add extras for processing
            route.validMethods = validMethods as RouteRequestType[];
            route.filename = file;

            // add to corresponding list
            (route.priority > 0 ? routePriorityAbove0 : route.priority == 0 ? routePriority0 : routePriorityBelow0).push(route);
        }

        // sort by priority
        routePriorityAbove0.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        routePriorityBelow0.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // load all above 0
        ServerManager.#loadOrderedRouteSet(routePriorityAbove0, router || ServerManager.app);

        // load all at 0
        ServerManager.#loadOrderedRouteSet(routePriority0, router || ServerManager.app);
        // including folders (recursion yay)
        for (const folder of priority0Folders) {
            let zeroRouter = express.Router();
            (router || ServerManager.app).use(`/${basename(folder)}`, zeroRouter);
            ServerManager.#loadRoutes(folder, zeroRouter);
        }

        // load all below zero
        ServerManager.#loadOrderedRouteSet(routePriorityBelow0, router || ServerManager.app);

        return ServerManager;
    }

    /**
     * Load an ordered set of routes onto a router.
     * @param routes The routes.
     * @param router The router to load the routes on.
     */
    static #loadOrderedRouteSet(routes: ProcessingRouteObject[], router: express.Express | express.Router): void {
        while (routes.length != 0) {
            let nextRoute = routes.shift();
            for (const method of nextRoute?.validMethods || []) {
                debug(`Loading method ${method} for ${nextRoute?.filename}...`);
                if (typeof nextRoute?.methods[method] != "function" && typeof nextRoute?.methods[method] != "object") {
                    debug(`Skipping method ${method} as it is not a function.`);
                    continue;
                }

                // @ts-expect-error
                // ignore error here - just ts being ts
                // if someone can be bothered to get the types exactly correct so that this error
                // doesn't arise that'd be great, but for now this is a decent approximation
                router[method](nextRoute.path, nextRoute.methods[method]);
                debug(`Loaded method ${method} for ${nextRoute.filename} at ${nextRoute.path}.`);
            }
        }
    }

    /**
     * Add a directory to the ServerManager's list of directories to search for static files.
     * @param dir The (absolute) path of the directory to add to the scanning list.
     * @returns A reference to the ServerManager class.
     */
    static addStaticDirectory(dir: string): ServerManager {
        if (!isAbsolute(dir)) throw new Error("Provided path was not absolute.");
        if (!ServerManager.#publicDirectories.includes(dir)) ServerManager.#publicDirectories.push(dir);
        debug(`Adding ${dir} to this list of directories to scan for static files.`);
        return ServerManager;
    }

    /**
     * Set the route directory.
     * @param dir The directory to set.
     * @returns A reference to the ServerManager class.
     */
    static setRouteDirectory(dir: string): ServerManager {
        if (!isAbsolute(dir)) throw new Error("Provided path was not absolute.");
        ServerManager.#routeDirectory = dir;
        info(`Set route directory to ${dir}.`);
        return ServerManager;
    }

    /**
     * Set the SSL directory.
     * @param dir The directory to set.
     * @returns A reference to the ServerManager class.
     */
    static setSSLDirectory(dir: string): ServerManager {
        if (!isAbsolute(dir)) throw new Error("Provided path was not absolute.");
        ServerManager.#sslDirectory = dir;
        info(`Set route directory to ${dir}.`);
        return ServerManager;
    }

    /**
     * Start the server.
     */
    static start() {
        if (!ServerManager.disableHTTPS) {
            ServerManager.#server = https.createServer({
                key: readFileSync(join(ServerManager.#sslDirectory, "server.key"), "utf-8"),
                cert: readFileSync(join(ServerManager.#sslDirectory, "server.crt"), "utf-8")
            }, ServerManager.app);
        } else {
            ServerManager.#server = http.createServer(ServerManager.app);
        }

        ServerManager.#server.listen(ServerManager.#port, meta?.listen || "0.0.0.0");

        ServerManager.#server.on("listening", () => {
            info(`Listening on ${meta?.listen || "0.0.0.0"}:${ServerManager.#port}.`);
        });
        ServerManager.#server.on("error", e => critical(e));
    }
}
