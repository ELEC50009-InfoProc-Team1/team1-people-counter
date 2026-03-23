import type { ConditionalKeys, Nullable } from "~/types.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "./DatabaseManager.js";
import { RoomManager } from "./RoomManager.js";

export type DoorwayRecord = {
    id: string;
    inRoomID: Nullable<string>;
    outRoomID: Nullable<string>;
};

export class DoorwayManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a room from its ID.
     * @param roomID The room's ID.
     * @returns The room.
     */
    static get(doorwayID: string): Doorway | undefined {
        if (!doorwayID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM doorways WHERE id = ?").get(doorwayID) as DoorwayRecord
        );

        if (!entry) return;

        return DoorwayManager.create().readFromEntry(entry);
    }

    /**
     * Create a new room.
     * @returns The new room.
     */
    static create() {
        return new Doorway();
    }
}

export class Doorway {
    id: Nullable<string>;
    inRoomID: Nullable<string>;
    outRoomID: Nullable<string>;

    constructor() {
        this.id = undefined;
    }

    get inRoom() {
        if (!this.inRoomID) return;
        else return RoomManager.get(this.inRoomID);
    }

    get outRoom() {
        if (!this.outRoomID) return;
        else return RoomManager.get(this.outRoomID);
    }

    /**
     * Read a DB entry's values into this room.
     * @param entry The DB entry.
     * @returns This room.
     */
    readFromEntry(entry: DoorwayRecord) {
        ([
            "id",
            "inRoomID",
            "outRoomID"
        ] as (ConditionalKeys<DoorwayRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
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
            db.prepare("REPLACE INTO doorways (id, inRoomID, outRoomID) VALUES (?, ?, ?)").run(this.id, this.inRoomID, this.outRoomID)
        );

        return this;
    }

    /**
     * Delete this room.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a doorway without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM doorways WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }

    /**
     * Trigger someone entering through this doorway.
     * @returns This doorway.
     */
    triggerEnterRoom() {
        let inRoom = this.inRoom;
        if (inRoom) {
            inRoom.currentNoOfPeople++;
            inRoom.save();
        }

        let outRoom = this.outRoom;
        if (outRoom) {
            outRoom.currentNoOfPeople--;
            outRoom.currentNoOfPeople = Math.max(outRoom.currentNoOfPeople, 0);
            outRoom.save();
        }

        return this;
    }

    /**
     * Trigger someone exiting through this doorway.
     * @returns This doorway.
     */
    triggerExitRoom() {
        let inRoom = this.inRoom;
        if (inRoom) {
            inRoom.currentNoOfPeople--;
            inRoom.currentNoOfPeople = Math.max(inRoom.currentNoOfPeople, 0);
            inRoom.save();
        }

        let outRoom = this.outRoom;
        if (outRoom) {
            outRoom.currentNoOfPeople++;
            outRoom.save();
        }

        return this;
    }
}
