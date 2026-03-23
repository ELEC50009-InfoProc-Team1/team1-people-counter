import passport from "passport";
import express from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { ClientSafeError } from "~/classes/ClientSafeError.js";
import type { AuthType } from "~/managers/auth/AuthManager.js";
import { LocalAuthDetails, LocalAuthManager } from "~/managers/auth/LocalAuthManager.js";
import { UserManager, type User as PassageUser } from "~/managers/data/UserManager.js";
import type { Nullable } from "~/types.js";
import { compareHash } from "~/util/compareHash.js";

const separatorChar = "$";

// session valid for 24 hours by default
const sessionDefaultValid = new Date(1000 * 60 * 60 * 24);

// typescript pain
declare global {
    namespace Express {
        interface User extends PassageUser { }
    }
}

passport.serializeUser((user: Express.User, done) => {
    if (!user.currentSessionKey) {
        user.currentSessionKey = `${user.id}${separatorChar}${user.newSession({ validDuration: sessionDefaultValid })}`;
    }

    done(null, user.currentSessionKey);
});

passport.deserializeUser((sessionKey: string, done) => {
    let user: Nullable<PassageUser> = UserManager.get(sessionKey.split(separatorChar)[0] || "");
    if (!user) return done(null, null);

    let sessions = user.getSessions().filter(x => (x.expires?.getTime() || 0) > new Date().getTime());
    let keyParts = sessionKey.split(separatorChar);
    keyParts.shift();
    let key = keyParts.join(separatorChar);

    let found = false;
    for (let i = 0; i < sessions.length && !found; i++) {
        if (sessions[i]?.id !== undefined) found ||= compareHash(key, sessions[i]?.id as string);
        if (found) {
            user.currentSessionID = sessions[i]?.id as string;
            break;
        }
    }

    if (found) return done(null, user);
    else return done(null, null);
});



// local auth
passport.use(
    new LocalStrategy({
        passReqToCallback: true
    },
        (req: express.Request, username, password, done) => {
            const state = JSON.parse(Buffer.from((req.params.state as string) || "", "base64").toString());

            // @ts-ignore
            switch (state.attemptType as AuthType) {
                case "login":
                    let userAuthDetails = LocalAuthManager.getForUsername(username);
                    if (!userAuthDetails) return done(new ClientSafeError("Incorrect username or password."));

                    if (!(userAuthDetails as LocalAuthDetails).checkPassword(password)) return done(new Error("Incorrect username or password."));
                    let user = UserManager.get(userAuthDetails.userID || "");
                    if (!user) return done(new ClientSafeError("Incorrect username or password."));

                    return done(null, user);
                case "signup":
                // do not
                default:
                    return done(new ClientSafeError("Invalid auth method."));
                    break;
            }
        }
    )
);
