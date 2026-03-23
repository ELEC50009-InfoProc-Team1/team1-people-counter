import { Databases } from "./DatabaseManager.js";

export class GlobalPermissionManager {
    /**
     * Check if a user has a permission.
     * @param userID The user to check.
     * @param permission The permission to check for.
     * @returns Whether or not the user has the permission.
     */
    static has(userID: string, permission: GlobalPermissions) {
        if (GlobalPermissionManager.isAdmin(userID)) return true;
        return GlobalPermissionManager.exactHas(userID, permission);
    }

    /**
     * Check whether a user has an exact permission.
     * @param userID The user's ID.
     * @param permission The permission to check for.
     * @returns Whether or not the user has the permission.
     */
    static exactHas(userID: string, permission: GlobalPermissions) {
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM globalPermissions WHERE userID = ? AND permission = ?").get(userID, permission)
        );

        return Boolean(entry);
    }

    /**
     * Allow a user a permission.
     * @param userID The user.
     * @param permission The permission.
     */
    static allow(userID: string, permission: GlobalPermissions) {
        Databases.Data.operation(db =>
            db.prepare("REPLACE INTO globalPermissions (userID, permission) VALUES (?, ?)").run(userID, permission)
        );
    }

    /**
     * Forbid a user a permission.
     * @param userID The user.
     * @param permission The permission.
     */
    static forbid(userID: string, permission: GlobalPermissions) {
        Databases.Data.operation(db =>
            db.prepare("DELETE FROM globalPermissions WHERE userID = ? AND permission = ?").run(userID, permission)
        );
    }

    /**
     * Check if a user is an admin.
     * @param userID The user's ID.
     * @returns Whether or not the user is an admin.
     */
    static isAdmin(userID: string) {
        let entry = Databases.Data.operation(db =>
            db.prepare("SELECT * FROM globalPermissions WHERE userID = ? AND permission = ?").get(userID, GlobalPermissions.ADMINISTRATOR)
        );

        return Boolean(entry);
    }
}

export enum GlobalPermissions {
    ADMINISTRATOR = "ADMINISTRATOR",
    CREATE_ORGANISATION = "CREATE_ORGANISATION",
    MODIFY_ORGANISATION = "MODIFY_ORGANISATION",
    DELETE_ORGANISATION = "DELETE_ORGANISATION",
    CREATE_DEPARTMENT = "CREATE_DEPARTMENT",
    MODIFY_DEPARTMENT = "MODIFY_DEPARTMENT",
    DELETE_DEPARTMENT = "DELETE_DEPARTMENT",
    CREATE_BUILDING = "CREATE_BUILDING",
    MODIFY_BUILDING = "MODIFY_BUILDING",
    DELETE_BUILDING = "DELETE_BUILDING",
    CREATE_FLOOR = "CREATE_FLOOR",
    MODIFY_FLOOR = "MODIFY_FLOOR",
    DELETE_FLOOR = "DELETE_FLOOR",
    CREATE_ROOM = "CREATE_ROOM",
    MODIFY_ROOM = "MODIFY_ROOM",
    DELETE_ROOM = "DELETE_ROOM",
    CREATE_DOORWAY = "CREATE_DOORWAY",
    MODIFY_DOORWAY = "MODIFY_DOORWAY",
    DELETE_DOORWAY = "DELETE_DOORWAY",
    CREATE_CAMERA = "CREATE_CAMERA",
    MODIFY_CAMERA = "MODIFY_CAMERA",
    DELETE_CAMERA = "DELETE_CAMERA"
}
