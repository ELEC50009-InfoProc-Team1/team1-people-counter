import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "../DatabaseManager.js";
import { BuildingManager } from "./BuildingManager.js";

export type FloorRecord = {
    id: string;
    name: Nullable<string>;
    buildingID: Nullable<string>;
};

export class FloorManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a floor from its ID.
     * @param floorID The floor's ID.
     * @returns The floor.
     */
    static get(floorID: string): Floor | undefined {
        if (!floorID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM floors WHERE id = ?").get(floorID) as FloorRecord
        );

        if (!entry) return;

        return FloorManager.create().readFromEntry(entry);
    }

    /**
     * Create a new floor.
     * @returns The new floor.
     */
    static create() {
        return new Floor();
    }
}

export class Floor {
    #_name: Nullable<string>;
    id: Nullable<string>;
    buildingID: Nullable<string>;

    constructor() {
        this.#_name = "unnamed floor";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(FloorManager.namePattern)) return;
        else this.#_name = value;
    }

    get building() {
        if (!this.buildingID) return;
        return BuildingManager.get(this.buildingID);
    }

    /**
     * Read a DB entry's values into this floor.
     * @param entry The DB entry.
     * @returns This floor.
     */
    readFromEntry(entry: FloorRecord) {
        ([
            "id",
            "name",
            "buildingID"
        ] as (ConditionalKeys<FloorRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this floor has an ID.
     * @returns This floor.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this floor.
     * @returns This floor.
     */
    save() {
        if (!this.id) throw new Error("Cannot save floor without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO floors (id, name, buildingID) VALUES (?, ?, ?)").run(this.id, this.name, this.buildingID)
        );

        return this;
    }

    /**
     * Delete this floor.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a floor without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM floors WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }
}
