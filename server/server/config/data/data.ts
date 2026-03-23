import { join } from "node:path";
import { Databases } from "~/managers/data/DatabaseManager.js";

Databases.Data.setDefinitions([
    // user management
    "users (id TEXT, name TEXT, PRIMARY KEY(id))",
    "sessions (id TEXT, userID TEXT, created INTEGER, expires INTEGER, PRIMARY KEY(id), FOREIGN KEY(userID) REFERENCES users (id))",

    // authentication
    "localLogins (userID TEXT UNIQUE, username TEXT, passwordHash TEXT, PRIMARY KEY(username), FOREIGN KEY(userID) REFERENCES users (id))",
    "apiKeys (userID TEXT, keyHash TEXT, PRIMARY KEY(userID, keyHash), FOREIGN KEY(userID) REFERENCES users (id))",

    // data stuff yayyyyy
    "organisations (id TEXT UNIQUE, name TEXT, PRIMARY KEY(id))",
    "departments (id TEXT UNIQUE, name TEXT, organisationID TEXT, PRIMARY KEY(id), FOREIGN KEY(organisationID) REFERENCES organisations (id))",
    "buildings (id TEXT UNIQUE, name TEXT, departmentID TEXT, PRIMARY KEY(id), FOREIGN KEY(departmentID) REFERENCES departments (id))",
    "floors (id TEXT UNIQUE, name TEXT, buildingID TEXT, PRIMARY KEY(id), FOREIGN KEY(buildingID) REFERENCES buildings (id))",
    "rooms (id TEXT UNIQUE, name TEXT, floorID TEXT, maxCapacity INTEGER, currentNoOfPeople INTEGER, PRIMARY KEY(id), FOREIGN KEY(floorID) REFERENCES floors (id))",
    "doorways (id TEXT UNIQUE, inRoomID TEXT, outRoomID TEXT, PRIMARY KEY(id), FOREIGN KEY(inRoomID) REFERENCES rooms (id), FOREIGN KEY(outRoomID) REFERENCES rooms (id))",
    "cameras (id TEXT UNIQUE, userID TEXT, name TEXT, location TEXT UNIQUE, PRIMARY KEY(id), FOREIGN KEY(userID) REFERENCES users (id), FOREIGN KEY(location) REFERENCES doorways (id))",

    // user management
    "departmentMember (departmentID TEXT, userID TEXT, PRIMARY KEY(departmentID, userID), FOREIGN KEY(departmentID) REFERENCES departments (id), FOREIGN KEY(userID) REFERENCES users (id))",
    "globalPermissions (userID TEXT, permission TEXT, PRIMARY KEY(userID, permission), FOREIGN KEY(userID) REFERENCES users (id))",

    // statistics
    "occupancyAtTime (roomID TEXT, occupancy INTEGER, timestamp INTEGER, PRIMARY KEY(roomID, timestamp), FOREIGN KEY(roomID) REFERENCES rooms (id))",

]).init(join(process.cwd(), "data", "data.sqlite"));
