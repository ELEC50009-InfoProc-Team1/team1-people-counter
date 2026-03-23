import { Databases } from "./DatabaseManager.js";
import type { ConditionalKeys, Nullable } from "~/types.js";
import { tokenGenerate } from "~/util/tokenGenerate.js";
import { hash } from "~/util/hash.js";
import { nextID } from "~/util/nextID.js";
import { CameraManager, type CameraRecord } from "./CameraManager.js";
import { RoomManager, type RoomRecord } from "./RoomManager.js";
import { FloorManager, type FloorRecord } from "./structure/FloorManager.js";
import { BuildingManager, type BuildingRecord } from "./structure/BuildingManager.js";
import { DepartmentManager, type DepartmentRecord } from "./structure/DepartmentManager.js";
import { OrganisationManager, type OrganisationRecord } from "./structure/OrganisationManager.js";

export type UserRecord = {
    id: string;
    name: Nullable<string>;
};

export class UserManager {
    static namePattern = /^.{1,48}$/;

    /**
     * Get a user from their ID.
     * @param userID The user's ID.
     * @returns The user.
     */
    static get(userID: string): User | undefined {
        if (!userID) return;
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM users WHERE id = ?").get(userID) as UserRecord
        );
        if (!entry) return;

        return UserManager.create().readFromEntry(entry);
    }

    /**
     * Create a new user.
     * @returns The new user.
     */
    static create() {
        return new User();
    }
}


export class User {
    #_name: Nullable<string>;
    id: Nullable<string>;
    /** for session tracking */
    currentSessionKey: Nullable<string>;
    currentSessionID: Nullable<string>;

    constructor() {
        this.#_name = "unnamed user";
        this.id = undefined;
    }

    get name() {
        return this.#_name;
    }

    set name(value: Nullable<string>) {
        if (!value) this.#_name = undefined;
        else if (!value.match(UserManager.namePattern)) return;
        else this.#_name = value;
    }

    /**
     * Read a DB entry's values into this user.
     * @param entry The DB entry.
     * @returns This user.
     */
    readFromEntry(entry: UserRecord) {
        ([
            "id",
            "name"
        ] as (ConditionalKeys<UserRecord, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        return this;
    }

    /**
     * Check this user has an ID.
     * @returns This user.
     */
    checkID() {
        this.id ||= nextID();
        return this;
    }

    /**
     * Save this user.
     * @returns This user.
     */
    save() {
        if (!this.id) throw new Error("Cannot save user without an ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO users (id, name) VALUES (?, ?)").run(this.id, this.name)
        );
        return this;
    }

    /**
     * Get this user's sessions.
     * @returns The sessions.
     */
    getSessions(): UserSession[] {
        let entries = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM sessions WHERE userID = ?").all(this.id) as SessionRecord[]
        );

        return entries.filter(x => x).map(x => new UserSession().readFromEntry(x));
    }

    /**
     * Start a new session for this user.
     * @param creationSettings Settings to create the session with.
     * @returns The created session token.
     */
    newSession(creationSettings: SessionCreationSettings) {
        if (!this.id) throw new Error("Cannot start a session for a user without an ID.");
        if (!creationSettings.validDuration) throw new Error("Session must be started with a valid duration.");

        let token = tokenGenerate();
        let hashed = hash(token);
        let start = new Date().getTime();

        Databases.Data.operation(db =>
            db.prepare("INSERT INTO sessions (id, userID, created, expires) VALUES (?, ?, ?, ?)")
                .run(hashed, this.id, start, start + (creationSettings.validDuration.getTime() || 1000 * 60 * 60))
        );

        return token;
    }

    /**
     * Delete this user and all information connected to them.
     */
    delete() {
        if (!this.id) throw new Error("Cannot delete a user without an ID.");

        Databases.Data.operation(db => {
            // delete group membership
            db.prepare("DELETE FROM eventGroupMember WHERE userID = ?").run(this.id);
            db.prepare("DELETE FROM groupMember WHERE user = ?").run(this.id);

            // auth stuff
            db.prepare("DELETE FROM googleLogins WHERE userID = ?").run(this.id);
            db.prepare("DELETE FROM localLogins WHERE userID = ?").run(this.id);

            db.prepare("DELETE FROM sessions WHERE userID = ?").run(this.id);

            db.prepare("DELETE FROM users WHERE userID = ?").run(this.id);
        });

        // clear ID so other functions can't be run
        this.id = undefined;
    }

    /**
     * Get the camera attached to this user.
     * @returns The camera.
     */
    getCamera() {
        if (!this.id) return;
        return CameraManager.getForUser(this.id);
    }

    /**
     * Get the organisations this user can see.
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
                        FROM departmentMember
                        WHERE userID = ?
                    )
                )
            )
            SELECT *
            FROM validOrganisations
            `).all(this.id) as OrganisationRecord[]
        );

        if (!entries) return [];

        return entries.map(x => OrganisationManager.create().readFromEntry(x));
    }

    /**
     * Get the departments this user can see.
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
                            FROM departmentMember
                            WHERE userID = ?
                        )
                    )
                )
            )
            SELECT *
            FROM validDepartments
            `).all(this.id) as DepartmentRecord[]
        );

        if (!entries) return [];

        return entries.map(x => DepartmentManager.create().readFromEntry(x));
    }

    /**
     * Get the buildings this user can see.
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
                                FROM departmentMember
                                WHERE userID = ?
                            )
                        )
                    )
                )
            )
            SELECT *
            FROM validBuildings
            `).all(this.id) as BuildingRecord[]
        );

        if (!entries) return [];

        return entries.map(x => BuildingManager.create().readFromEntry(x));
    }

    /**
     * Get the floors this user can see.
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
                                    FROM departmentMember
                                    WHERE userID = ?
                                )
                            )
                        )
                    )
                )
            )
            SELECT *
            FROM validFloors
            `).all(this.id) as FloorRecord[]
        );

        if (!entries) return [];

        return entries.map(x => FloorManager.create().readFromEntry(x));
    }

    /**
     * Get the rooms this user can see.
     * @returns The rooms.
     */
    getVisibleRooms() {
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
                                        FROM departmentMember
                                        WHERE userID = ?
                                    )
                                )
                            )
                        )
                    )
                )
            )
            SELECT *
            FROM rooms
            WHERE id IN (
                SELECT id
                FROM validRooms
            )
            `).all(this.id) as RoomRecord[]
        );

        if (!entries) return [];

        return entries.map(x => RoomManager.create().readFromEntry(x));
    }

    /**
     * Get all visible cameras based on which departments this user is a member of.
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
                                        FROM departmentMember
                                        WHERE userID = ?
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
            `).all(this.id) as CameraRecord[]
        );

        if (!entries) return [];

        return entries.map(x => CameraManager.create().readFromEntry(x));
    }
}

type SessionCreationSettings = {
    /** How long the session should be valid for. */
    validDuration: Date;
};

type SessionRecord = {
    id: string;
    userID: string;
    created: number;
    expires: number;
};

class UserSession {
    /** This session's ID. */
    id: Nullable<string>;
    /** This session's user. */
    userID: Nullable<string>;
    /** The time this session was created. */
    created: Nullable<Date>;
    /** The time this session expires. */
    expires: Nullable<Date>;

    /**
     * Read user session information in from a database entry.
     * @param entry The entry to read from.
     * @returns This UserSession.
     */
    readFromEntry(entry: SessionRecord) {
        ([
            "id",
            "userID",
        ] as (ConditionalKeys<UserSession, string>)[]).forEach(x => {
            this[x] = entry[x]?.toString?.();
        });

        ([
            "created",
            "expires"
        ] as (ConditionalKeys<UserSession, Date>)[]).forEach(x => {
            this[x] = new Date(entry[x]);
        });

        return this;
    }

    /**
     * Delete this session.
     */
    delete() {
        if (!this.id) throw new Error("Cannot end session without an ID.");
        Databases.Data.operation(db =>
            db.prepare("DELETE FROM sessions WHERE id = ?").run(this.id)
        );
        // clear ID so other operations can't be called
        this.id = undefined;
    }

    /**
     * Save this session.
     * @returns This session.
     */
    save() {
        if (!this.id) throw new Error("Cannot save session without ID.");
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO sessions (id, userID, created, expires) VALUES (?, ?, ?, ?)")
                .run(this.id, this.userID, this.created?.getTime(), this.expires?.getTime())
        );

        return this;
    }
}
