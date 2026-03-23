import { join } from "node:path";

import LoggingManager, { type LoggerSettings } from "~/managers/LoggingManager.js";
import loggingConfig from "./config/logging.json" with { type: "json" };

import ServerManager from "~/managers/ServerManager.js";
import { MalformedRequest, ServerError } from "~/util/standardResponses.js";
import type { ErrorRequestHandler } from "express";

LoggingManager.createLogger(loggingConfig as LoggerSettings);

//#region DB setup
import "./config/data/data.js";
//#endregion

//#region server setup
ServerManager.init(3000);
ServerManager.disableHTTPS = true;
ServerManager.setRouteDirectory(join(import.meta.dirname, "src", "routes"));    // in built folder
ServerManager.addStaticDirectory(join(process.cwd(), "public"));                 // in unbuilt folder

// cors pain
import cors from "cors";
import serverMeta from "./config/meta.json" with { type: "json" };
ServerManager.app.use(cors(serverMeta.cors));

//#endregion

//#region passport setup
import "config/auth/passport.js";

// session cookies
import CookieParser from "cookie-parser";
import CookieSession from "cookie-session";
ServerManager.app.use(CookieParser());
ServerManager.app.use(CookieSession({
    keys: process.env["COOKIE_KEY"] ? [
        process.env["COOKIE_KEY"]
    ] : undefined,
    domain: `${serverMeta.basehostname.split(":")[0]}`,
    maxAge: 7 * 24 * 60 * 60 * 1000
}));

// https://stackoverflow.com/a/75195471
ServerManager.app.use((req, _res, next) => {
    if (req.session && !req.session.regenerate) {
        req.session.regenerate = (cb: any) => {
            cb();
        };
    }
    if (req.session && !req.session.save) {
        req.session.save = (cb: any) => {
            cb();
        };
    }
    next();
});

import passport from "passport";
ServerManager.app.use(passport.initialize());
ServerManager.app.use(passport.session());
//#endregion

//#region json parsing
import { json } from "express";
ServerManager.app.use(json());

//#endregion

//#region api key setup
import { UserManager } from "~/managers/data/UserManager.js";
import { APIKeyAuthManager } from "~/managers/auth/APIKeyAuthManager.js";

ServerManager.app.use((req, _res, next) => {
    let key = req.get("x-api-key");
    if (key) {
        if (!req.user) {
            let userID = key.split("_")[0];
            let user = UserManager.get(userID || "");
            if (!user) return next();
            let keys = APIKeyAuthManager.get(user.id || "");
            for (let i = 0; i < keys.length; i++) {
                if (keys[i]?.checkAPIKey(key.split("_").slice(1).join("_"))) {
                    req.user = user;
                    return next();
                }
            }
        }
    }
    return next();
});
//#endregion

//#region api docs setup
// this annoyingly can't be done through the routing system because swagger is stupid

import swaggerUI from "swagger-ui-express";
[
    "v1"
].forEach(async x => {
    // get specification
    try {
        const specification = (await import(`../src/routes/api/${x}/specification.json`, { with: { type: "json" } })).default;

        ServerManager.app.use(`/api/${x}/docs`, swaggerUI.serve, swaggerUI.setup(specification));
    } catch (e: any) {
        LoggingManager.warn(`Couldn't load API specification for version ${x}:`, e);
    }
});
//#endregion

// @ts-ignore
import { LocalAuthManager } from "~/managers/auth/LocalAuthManager.js";
import readline from "node:readline";
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on("line", async line => {
    try {
        let eresult = eval(line);
        console.log(eresult);
    } catch (err) {
        console.error(err);
    }
});

// hacky implementation for occupancy stats
import * as cron from "cron";
import { Databases } from "~/managers/data/DatabaseManager.js";
const insertJob = new cron.CronJob(
    // every 5m
    "0 */5 * * * *",
    () => {
        LoggingManager.debug("Running occupancy tracking...");
        try {
            Databases.Data.operation(db =>
                db.prepare(`
                WITH times(timestamp) AS (
                    SELECT v.*
                    FROM (VALUES (?)) v
                )

                INSERT INTO occupancyAtTime (roomID, occupancy, timestamp)
                SELECT id, currentNoOfPeople, timestamp
                FROM rooms CROSS JOIN times;
            `).run(new Date().getTime())
            );
        } catch (e: any) {
            LoggingManager.error("Failed to run occupancy tracking:", e);
        } finally {
            LoggingManager.debug("Finished running occupancy tracking.");
        }
    },
);

const cleanJob = new cron.CronJob(
    // every day
    "0 0 0 * * *",
    () => {
        Databases.Data.operation(db =>
            // delete data older than a week old
            db.prepare("DELETE FROM occupancyAtTime WHERE timestamp < ?").run(new Date().getTime() - (1000 * 60 * 60 * 24 * 7))
        );
    }
);

LoggingManager.info(`Next stats clean job running: ${cron.sendAt("0 0 0 * * *").toISO()}`);
insertJob.start();
cleanJob.start();

//#region big errors
// 500
const serverErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof SyntaxError) {
        if (!res.headersSent) {
            return MalformedRequest(res);
        }
    }

    if (res.headersSent) {
        return next(err);
    }

    ServerError(res, "oh no big error");
    LoggingManager.critical("Error through express:", err);
};
ServerManager.app.use(serverErrorHandler);
//#endregion

ServerManager.setupFromState().then(() => {
    ;
    ServerManager.start();
});
