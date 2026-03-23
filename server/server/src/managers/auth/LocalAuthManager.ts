import type { Nullable } from "~/types.js";
import { MethodManager } from "./AuthManager.js";
import { Databases } from "../data/DatabaseManager.js";
import { compareHash } from "~/util/compareHash.js";
import { hash } from "~/util/hash.js";

export class LocalAuthManager extends MethodManager {
    static usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    static passwordPattern = /^[a-zA-Z0-9\._+\-/\\*=!"£$%^&*()\[\]{}:;@#~&<>? ]{12,255}$/;

    static override createForUser(userID: string, username: string, password: string) {
        if (!userID) throw new Error("Cannot create a local login without a user ID.");
        if (!username) throw new Error("Cannot create a local login without a username.");
        if (!password) throw new Error("Cannot create a local login without a password.");

        if (LocalAuthManager.get(userID)) {
            throw new Error("Cannot create a local login for a user that already has a local login.");
        }

        if (LocalAuthManager.getForUsername(username)) {
            throw new Error("Requested username is already in use.");
        }

        if (!username.match(LocalAuthManager.usernamePattern)) {
            throw new Error("Requested username is not valid.");
        }

        if (!password.match(LocalAuthManager.passwordPattern)) {
            throw new Error("Requested password is not valid.");
        }

        let details = new LocalAuthDetails();
        details.username = username;
        details.userID = userID;
        let hashed = hash(password);
        details.passwordHash = hashed;

        details.save();

        return details;
    }

    /**
     * Get a user's LocalAuthDetails.
     * @param username The user's username.
     * @returns The resulting LocalAuthDetails.
     */
    static getForUsername(username: string): Nullable<LocalAuthDetails> {
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM localLogins WHERE username = ?").get(username) as LocalAuthRecord
        );

        if (!entry) return undefined;
        let details = new LocalAuthDetails();
        details.readFromEntry(entry);

        return details;
    }

    /**
     * Get a user's LocalAuthDetails.
     * @param userID The user's ID.
     * @returns The resulting LocalAuthDetails.
     */
    static override get(userID: string) {
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM localLogins WHERE userID = ?").get(userID) as LocalAuthRecord
        );

        if (!entry) return undefined;
        let details = new LocalAuthDetails();
        details.readFromEntry(entry);

        return details;
    }
}

type LocalAuthRecord = {
    username: string;
    userID: string;
    passwordHash: string;
};

export class LocalAuthDetails {
    #_username: Nullable<string>;
    userID: Nullable<string>;
    passwordHash: Nullable<string>;

    get username() {
        return this.#_username;
    }

    set username(value: Nullable<string>) {
        if (!value) this.#_username = undefined;
        else if (!value.match(LocalAuthManager.usernamePattern)) return;
        else this.#_username = value;
    }

    /**
     * Read this set of LocalAuthDetails from a DB entry.
     * @param entry The entry.
     * @returns This set of LocalAuthDetails.
     */
    readFromEntry(entry: LocalAuthRecord) {
        ([
            "username",
            "userID",
            "passwordHash"
        ] as (keyof LocalAuthRecord)[]).forEach(x => {
            this[x] = entry[x].toString?.();
        });

        return this;
    }

    /**
     * Save this set of LocalAuthDetails.
     * @returns This set of LocalAuthDetails.
     */
    save() {
        if (!this.userID) throw new Error("Cannot save LocalAuthDetails without a user ID.");
        if (!this.username) throw new Error("Cannot save LocalAuthDetails without a username.");
        if (!this.passwordHash) throw new Error("Cannot save LocalAuthDetails without a password hash.");

        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO localLogins (userID, username, passwordHash) VALUES (?, ?, ?)")
                .run(this.userID, this.username, this.passwordHash)
        );

        return this;
    }

    /**
     * Check if a password matches the password hash.
     * @param password The plaintext password.
     * @returns Whether the password was a match.
     */
    checkPassword(password: string) {
        if (!this.passwordHash) throw new Error("Cannot check against empty password hash.");

        return compareHash(password, this.passwordHash);
    }

    /**
     * Delete this set of LocalAuthDetails.
     */
    delete() {
        if (!this.username) throw new Error("Cannot delete LocalAuthDetails without a username.");

        Databases.Data.operation(db =>
            db.prepare("DELETE FROM localLogins WHERE username = ?").run(this.username)
        );
    }
}
