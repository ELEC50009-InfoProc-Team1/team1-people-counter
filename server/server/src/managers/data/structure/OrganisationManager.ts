import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "../DatabaseManager.js";

export type OrganisationRecord = {
    id: string;
    name: Nullable<string>;
};

export class OrganisationManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a organisation from its ID.
     * @param organisationID The organisation's ID.
     * @returns The organisation.
     */
    static get(organisationID: string): Organisation | undefined {
        if (!organisationID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM organisations WHERE id = ?").get(organisationID) as OrganisationRecord
        );

        if (!entry) return;

        return OrganisationManager.create().readFromEntry(entry);
    }

    /**
     * Create a new organisation.
     * @returns The new organisation.
     */
    static create() {
        return new Organisation();
    }
}

export class Organisation {
    #_name: Nullable<string>;
    id: Nullable<string>;

    constructor() {
        this.#_name = "unnamed organisation";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(OrganisationManager.namePattern)) return;
        else this.#_name = value;
    }

    /**
     * Read a DB entry's values into this organisation.
     * @param entry The DB entry.
     * @returns This organisation.
     */
    readFromEntry(entry: OrganisationRecord) {
        ([
            "id",
            "name"
        ] as (ConditionalKeys<OrganisationRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this organisation has an ID.
     * @returns This organisation.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this organisation.
     * @returns This organisation.
     */
    save() {
        if (!this.id) throw new Error("Cannot save organisation without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO organisations (id, name) VALUES (?, ?)").run(this.id, this.name)
        );

        return this;
    }

    /**
     * Delete this organisation.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a organisation without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM organisations WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }
}
