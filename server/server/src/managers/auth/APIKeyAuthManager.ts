import type { Nullable } from "~/types.js";
import { UserManager } from "../data/UserManager.js";
import { MethodManager } from "./AuthManager.js";
import { Databases } from "../data/DatabaseManager.js";
import { compareHash } from "~/util/compareHash.js";
import { tokenGenerate } from "~/util/tokenGenerate.js";
import { hash } from "~/util/hash.js";

export class APIKeyAuthManager extends MethodManager {
    static override createForUser(userID: string) {
        if (!userID) throw new Error("Cannot create an API key without a user ID.");

        if (!UserManager.get(userID)) throw new Error("Cannot create an API key for a non-existent user.");

        let details = new APIKeyDetails();
        details.userID = userID;

        let key = tokenGenerate();
        let hashed = hash(key);

        details.keyHash = hashed;

        details.save();
        return { details, key };
    }

    static override get(userID: string) {
        let entries = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM apiKeys WHERE userID = ?").all(userID) as APIKeyRecord[]
        );

        if (!entries?.length) return [];
        else return entries.map(x => new APIKeyDetails().readFromEntry(x));
    }
}

type APIKeyRecord = {
    userID: string;
    keyHash: string;
};

export class APIKeyDetails {
    userID: Nullable<string>;
    keyHash: Nullable<string>;

    /**
     * Read the set of APIKeyDetails from a DB entry.
     * @param entry The entry.
     * @returns This set of APIKeyDetails.
     */
    readFromEntry(entry: APIKeyRecord) {
        ([
            "userID",
            "keyHash"
        ] as (keyof APIKeyRecord)[]).forEach(x => {
            this[x] = entry[x].toString?.();
        });

        return this;
    }

    /**
     * Save this set of APIKeyDetails.
     * @returns This set of APIKeyDetails.
     */
    save() {
        if (!this.userID) throw new Error("Cannot save APIKeyDetails without a user ID.");
        if (!this.keyHash) throw new Error("Cannot save empty API key.");

        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO apiKeys (userID, keyHash) VALUES (?, ?)")
                .run(this.userID, this.keyHash)
        );

        return this;
    }

    /**
     * Check if an API key matches the key hash.
     * @param key The plaintext API key.
     * @returns Whether the API key was a match.
     */
    checkAPIKey(key: string) {
        if (!this.keyHash) throw new Error("Cannot check against empty API key.");

        return compareHash(key, this.keyHash);
    }

    /**
     * Delete this set of APIKeyDetails.
     */
    delete() {
        if (!this.userID) throw new Error("Cannot delete APIKeyDetails without a userID.");
        if (!this.keyHash) throw new Error("Cannot delete APIKeyDetails without a key hash.");

        Databases.Data.operation(db =>
            db.prepare("DELETE FROM apiKeys WHERE userID = ? AND keyHash = ?").run(this.userID, this.keyHash)
        );
    }
}
