import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "../DatabaseManager.js";
import { DepartmentManager } from "./DepartmentManager.js";

export type BuildingRecord = {
    id: string;
    name: Nullable<string>;
    departmentID: Nullable<string>;
};

export class BuildingManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a building from its ID.
     * @param buildingID The building's ID.
     * @returns The building.
     */
    static get(buildingID: string): Building | undefined {
        if (!buildingID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM buildings WHERE id = ?").get(buildingID) as BuildingRecord
        );

        if (!entry) return;

        return BuildingManager.create().readFromEntry(entry);
    }

    /**
     * Create a new building.
     * @returns The new building.
     */
    static create() {
        return new Building();
    }
}

export class Building {
    #_name: Nullable<string>;
    id: Nullable<string>;
    departmentID: Nullable<string>;

    constructor() {
        this.#_name = "unnamed building";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(BuildingManager.namePattern)) return;
        else this.#_name = value;
    }

    get department() {
        if (!this.departmentID) return;
        return DepartmentManager.get(this.departmentID);
    }

    /**
     * Read a DB entry's values into this building.
     * @param entry The DB entry.
     * @returns This building.
     */
    readFromEntry(entry: BuildingRecord) {
        ([
            "id",
            "name",
            "departmentID"
        ] as (ConditionalKeys<BuildingRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this building has an ID.
     * @returns This building.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this building.
     * @returns This building.
     */
    save() {
        if (!this.id) throw new Error("Cannot save building without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO buildings (id, name, departmentID) VALUES (?, ?, ?)").run(this.id, this.name, this.departmentID)
        );

        return this;
    }

    /**
     * Delete this building.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a building without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM buildings WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }
}
