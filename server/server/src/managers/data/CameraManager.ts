import type { ConditionalKeys, Nullable } from "~/types.js";
import { UserManager } from "./UserManager.js";
import { DoorwayManager } from "./DoorwayManager.js";
import { nextID } from "~/util/nextID.js";
import { Databases } from "./DatabaseManager.js";
import { RoomManager, type RoomRecord } from "./RoomManager.js";
import { FloorManager, type FloorRecord } from "./structure/FloorManager.js";
import { BuildingManager, type BuildingRecord } from "./structure/BuildingManager.js";
import { DepartmentManager, type DepartmentRecord } from "./structure/DepartmentManager.js";
import { OrganisationManager, type OrganisationRecord } from "./structure/OrganisationManager.js";

export type CameraRecord = {
    id: string;
    name: Nullable<string>;
    userID: Nullable<string>;
    location: Nullable<string>;
};

export class CameraManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a camera from its ID.
     * @param cameraID The camera's ID.
     * @returns The camera.
     */
    static get(cameraID: string): Camera | undefined {
        if (!cameraID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM cameras WHERE id = ?").get(cameraID) as CameraRecord
        );

        if (!entry) return;

        return CameraManager.create().readFromEntry(entry);
    }

    /**
     * Get a camera from its corresponding user ID.
     * @param userID The user's ID.
     * @returns The camera.
     */
    static getForUser(userID: string): Camera | undefined {
        if (!userID) return;

        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM cameras WHERE userID = ?").get(userID) as CameraRecord
        );

        if (!entry) return;

        return CameraManager.create().readFromEntry(entry);
    }

    /**
     * Create a new camera.
     * @returns The new camera.
     */
    static create() {
        return new Camera();
    }
}

export class Camera {
    #_name: Nullable<string>;
    id: Nullable<string>;
    userID: Nullable<string>;
    location: Nullable<string>;

    constructor() {
        this.#_name = "unnamed camera";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(CameraManager.namePattern)) return;
        else this.#_name = value;
    }

    get user() {
        if (!this.userID) return;
        return UserManager.get(this.userID);
    }

    get doorway() {
        if (!this.location) return;
        return DoorwayManager.get(this.location);
    }

    /**
     * Read a DB entry's values into this camera.
     * @param entry The DB entry.
     * @returns This camera.
     */
    readFromEntry(entry: CameraRecord) {
        ([
            "id",
            "name",
            "userID",
            "location"
        ] as (ConditionalKeys<CameraRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this camera has an ID.
     * @returns This camera.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this camera.
     * @returns This camera.
     */
    save() {
        if (!this.id) throw new Error("Cannot save camera without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO cameras (id, name, userID, location) VALUES (?, ?, ?, ?)").run(this.id, this.name, this.userID, this.location)
        );

        return this;
    }

    /**
     * Delete this camera.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a camera without an ID.");

        Databases.Data.operation(db => {
            db.prepare("DELETE FROM cameras WHERE id = ?").run(this.id);
        });

        this.id = undefined;
    }

    /**
     * Trigger this camera's 'enter room' event.
     * @returns This camera.
     */
    triggerEnter() {
        this.doorway?.triggerEnterRoom();
        return this;
    }

    /**
     * Trigger this camera's 'exit room' event.
     * @returns This camera.
     */
    triggerExit() {
        this.doorway?.triggerExitRoom();
        return this;
    }

    /**
     * Get all organisations this camera can see.
     * @returns The organisations.
     */
    getVisibleOrganisations() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validOrganisations AS (
                        SELECT *
                        FROM organisations
                        WHERE id IN (
                            SELECT organisationID
                            FROM departments
                            WHERE id IN (
                                SELECT departmentID
                                FROM buildings
                                WHERE id IN (
                                    SELECT buildingID
                                    FROM floors
                                    WHERE id IN (
                                        SELECT floorID
                                        FROM rooms
                                        WHERE id IN (
                                            SELECT inRoomID
                                            FROM doorways
                                            WHERE id IN (
                                                SELECT location
                                                FROM cameras
                                                WHERE id = ?
                                            )
                                            UNION
                                            SELECT outRoomID
                                            FROM doorways
                                            WHERE id IN (
                                                SELECT location
                                                FROM cameras
                                                WHERE id = ?
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM validOrganisations
            `).all(this.id, this.id) as OrganisationRecord[]
        );
        if (!entries) return [];

        return entries.map(x => OrganisationManager.create().readFromEntry(x));
    }

    /**
     * Get all departments this camera can see.
     * @returns The departments.
     */
    getVisibleDepartments() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validDepartments AS (
                    SELECT *
                    FROM departments
                    WHERE organisationID IN (
                        SELECT id
                        FROM organisations
                        WHERE id IN (
                            SELECT organisationID
                            FROM departments
                            WHERE id IN (
                                SELECT departmentID
                                FROM buildings
                                WHERE id IN (
                                    SELECT buildingID
                                    FROM floors
                                    WHERE id IN (
                                        SELECT floorID
                                        FROM rooms
                                        WHERE id IN (
                                            SELECT inRoomID
                                            FROM doorways
                                            WHERE id IN (
                                                SELECT location
                                                FROM cameras
                                                WHERE id = ?
                                            )
                                            UNION
                                            SELECT outRoomID
                                            FROM doorways
                                            WHERE id IN (
                                                SELECT location
                                                FROM cameras
                                                WHERE id = ?
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM validDepartments
            `).all(this.id, this.id) as DepartmentRecord[]
        );
        if (!entries) return [];

        return entries.map(x => DepartmentManager.create().readFromEntry(x));
    }

    /**
     * Get all buildings this camera can see.
     * @returns The buildings.
     */
    getVisibleBuildings() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validBuildings AS (
                    SELECT *
                    FROM buildings
                    WHERE departmentID IN (
                        SELECT id
                        FROM departments
                        WHERE organisationID IN (
                            SELECT id
                            FROM organisations
                            WHERE id IN (
                                SELECT organisationID
                                FROM departments
                                WHERE id IN (
                                    SELECT departmentID
                                    FROM buildings
                                    WHERE id IN (
                                        SELECT buildingID
                                        FROM floors
                                        WHERE id IN (
                                            SELECT floorID
                                            FROM rooms
                                            WHERE id IN (
                                                SELECT inRoomID
                                                FROM doorways
                                                WHERE id IN (
                                                    SELECT location
                                                    FROM cameras
                                                    WHERE id = ?
                                                )
                                                UNION
                                                SELECT outRoomID
                                                FROM doorways
                                                WHERE id IN (
                                                    SELECT location
                                                    FROM cameras
                                                    WHERE id = ?
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM validBuildings
            `).all(this.id, this.id) as BuildingRecord[]
        );
        if (!entries) return [];

        return entries.map(x => BuildingManager.create().readFromEntry(x));
    }

    /**
     * Get all floors this camera can see.
     * @returns The floors.
     */
    getVisibleFloors() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validFloors AS (
                    SELECT *
                    FROM floors
                    WHERE buildingID IN (
                        SELECT id
                        FROM buildings
                        WHERE departmentID IN (
                            SELECT id
                            FROM departments
                            WHERE organisationID IN (
                                SELECT id
                                FROM organisations
                                WHERE id IN (
                                    SELECT organisationID
                                    FROM departments
                                    WHERE id IN (
                                        SELECT departmentID
                                        FROM buildings
                                        WHERE id IN (
                                            SELECT buildingID
                                            FROM floors
                                            WHERE id IN (
                                                SELECT floorID
                                                FROM rooms
                                                WHERE id IN (
                                                    SELECT inRoomID
                                                    FROM doorways
                                                    WHERE id IN (
                                                        SELECT location
                                                        FROM cameras
                                                        WHERE id = ?
                                                    )
                                                    UNION
                                                    SELECT outRoomID
                                                    FROM doorways
                                                    WHERE id IN (
                                                        SELECT location
                                                        FROM cameras
                                                        WHERE id = ?
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM validFloors
            `).all(this.id, this.id) as FloorRecord[]
        );
        if (!entries) return [];

        return entries.map(x => FloorManager.create().readFromEntry(x));
    }

    /**
     * Get all rooms this camera can see.
     * @returns The rooms.
     */
    getVisibleRooms() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validRooms AS (
                    SELECT *
                    FROM rooms
                    WHERE floorID IN (
                        SELECT id
                        FROM floors
                        WHERE buildingID IN (
                            SELECT id
                            FROM buildings
                            WHERE departmentID IN (
                                SELECT id
                                FROM departments
                                WHERE organisationID IN (
                                    SELECT id
                                    FROM organisations
                                    WHERE id IN (
                                        SELECT organisationID
                                        FROM departments
                                        WHERE id IN (
                                            SELECT departmentID
                                            FROM buildings
                                            WHERE id IN (
                                                SELECT buildingID
                                                FROM floors
                                                WHERE id IN (
                                                    SELECT floorID
                                                    FROM rooms
                                                    WHERE id IN (
                                                        SELECT inRoomID
                                                        FROM doorways
                                                        WHERE id IN (
                                                            SELECT location
                                                            FROM cameras
                                                            WHERE id = ?
                                                        )
                                                        UNION
                                                        SELECT outRoomID
                                                        FROM doorways
                                                        WHERE id IN (
                                                            SELECT location
                                                            FROM cameras
                                                            WHERE id = ?
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM validRooms
            `).all(this.id, this.id) as RoomRecord[]
        );
        if (!entries) return [];

        return entries.map(x => RoomManager.create().readFromEntry(x));
    }

    /**
     * Get all cameras this camera can see (all cameras in the same organisation.)
     * @returns The cameras.
     */
    getVisibleCameras() {
        let entries = Databases.Data.operation(db =>
            db.prepare(`
                WITH validRooms AS (
                    SELECT id
                    FROM rooms
                    WHERE floorID IN (
                        SELECT id
                        FROM floors
                        WHERE buildingID IN (
                            SELECT id
                            FROM buildings
                            WHERE departmentID IN (
                                SELECT id
                                FROM departments
                                WHERE organisationID IN (
                                    SELECT id
                                    FROM organisations
                                    WHERE id IN (
                                        SELECT organisationID
                                        FROM departments
                                        WHERE id IN (
                                            SELECT departmentID
                                            FROM buildings
                                            WHERE id IN (
                                                SELECT buildingID
                                                FROM floors
                                                WHERE id IN (
                                                    SELECT floorID
                                                    FROM rooms
                                                    WHERE id IN (
                                                        SELECT inRoomID
                                                        FROM doorways
                                                        WHERE id IN (
                                                            SELECT location
                                                            FROM cameras
                                                            WHERE id = ?
                                                        )
                                                        UNION
                                                        SELECT outRoomID
                                                        FROM doorways
                                                        WHERE id IN (
                                                            SELECT location
                                                            FROM cameras
                                                            WHERE id = ?
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                SELECT *
                FROM cameras
                WHERE location IN (
                    SELECT id
                    FROM doorways
                    WHERE inRoomID IN (
                        SELECT id
                        FROM validRooms
                    )
                    OR outRoomID IN (
                        SELECT id
                        FROM validRooms
                    )
                )
            `).all(this.id, this.id) as CameraRecord[]
        );
        if (!entries) return [];

        return entries.map(x => CameraManager.create().readFromEntry(x));
    }
}
