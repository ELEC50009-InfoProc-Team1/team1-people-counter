import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "../DatabaseManager.js";
import { OrganisationManager } from "./OrganisationManager.js";

export type DepartmentRecord = {
    id: string;
    name: Nullable<string>;
    organisationID: Nullable<string>;
};

export class DepartmentManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a department from its ID.
     * @param departmentID The department's ID.
     * @returns The department.
     */
    static get(departmentID: string): Department | undefined {
        if (!departmentID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM departments WHERE id = ?").get(departmentID) as DepartmentRecord
        );

        if (!entry) return;

        return DepartmentManager.create().readFromEntry(entry);
    }

    /**
     * Create a new department.
     * @returns The new department.
     */
    static create() {
        return new Department();
    }
}

export class Department {
    #_name: Nullable<string>;
    id: Nullable<string>;
    organisationID: Nullable<string>;

    constructor() {
        this.#_name = "unnamed department";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(DepartmentManager.namePattern)) return;
        else this.#_name = value;
    }

    get organisation() {
        if (!this.organisationID) return;
        return OrganisationManager.get(this.organisationID);
    }

    /**
     * Read a DB entry's values into this department.
     * @param entry The DB entry.
     * @returns This department.
     */
    readFromEntry(entry: DepartmentRecord) {
        ([
            "id",
            "name",
            "organisationID"
        ] as (ConditionalKeys<DepartmentRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this department has an ID.
     * @returns This department.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this department.
     * @returns This department.
     */
    save() {
        if (!this.id) throw new Error("Cannot save department without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO departments (id, name, organisationID) VALUES (?, ?, ?)").run(this.id, this.name, this.organisationID)
        );

        return this;
    }

    /**
     * Delete this department.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a department without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM departments WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }
}
