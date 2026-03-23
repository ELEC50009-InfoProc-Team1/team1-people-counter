import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "./DatabaseManager.js";
import { FloorManager } from "./structure/FloorManager.js";

export type RoomRecord = {
    id: string;
    name: Nullable<string>;
    floorID: Nullable<string>;
    maxCapacity: number;
    currentNoOfPeople: number;
};

export class RoomManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a room from its ID.
     * @param roomID The room's ID.
     * @returns The room.
     */
    static get(roomID: string): Room | undefined {
        if (!roomID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomID) as RoomRecord
        );

        if (!entry) return;

        return RoomManager.create().readFromEntry(entry);
    }

    /**
     * Create a new room.
     * @returns The new room.
     */
    static create() {
        return new Room();
    }
}

export class Room {
    #_name: Nullable<string>;
    id: Nullable<string>;
    floorID: Nullable<string>;
    maxCapacity: number = 0;
    currentNoOfPeople: number = 0;

    constructor() {
        this.#_name = "unnamed room";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(RoomManager.namePattern)) return;
        else this.#_name = value;
    }

    get floor() {
        if (!this.floorID) return;
        return FloorManager.get(this.floorID);
    }

    /**
     * Read a DB entry's values into this room.
     * @param entry The DB entry.
     * @returns This room.
     */
    readFromEntry(entry: RoomRecord) {
        ([
            "id",
            "name",
            "floorID"
        ] as (ConditionalKeys<RoomRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        ([
            "maxCapacity",
            "currentNoOfPeople"
        ] as (ConditionalKeys<RoomRecord, number>)[]).forEach(x => {
            this[x] = entry[x];
        });

        return this;
    }

    /**
     * Check this room has an ID.
     * @returns This room.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this room.
     * @returns This room.
     */
    save() {
        if (!this.id) throw new Error("Cannot save room without an ID.");


        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO rooms (id, name, floorID, maxCapacity, currentNoOfPeople) VALUES (?, ?, ?, ?, ?)").run(this.id, this.name, this.floorID, this.maxCapacity, this.currentNoOfPeople)
        );

        return this;
    }

    /**
     * Delete this room.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a room without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM rooms WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }
}
