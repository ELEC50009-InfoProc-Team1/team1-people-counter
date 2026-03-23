import betterSQLite3, { type Database } from "better-sqlite3";

class DatabaseManager {
    /**
     * Whether the database manager is ready to be used.
     */
    #ready = false;

    /**
     * The path of the database.
     */
    #path: string | undefined;

    /**
     * All table definitions. THIS MUST BE SAFE - DO ***NOT*** ALLOW USER INPUT TO THIS
     */
    #tableDefinitions: string[] = [];

    #initialising = false;

    /**
     * Set the table definitions. This function deletes itself after being called for the first time.
     * @param definitions The table definitions.
     * @returns This DatabaseManager.
     */
    setDefinitions(definitions: string[]) {
        this.#tableDefinitions = definitions;
        // remove this function
        // @ts-expect-error
        this.setDefinitions = undefined;
        return this;
    }

    /**
     * Initialise this DatabaseManager.
     * @param path The path to the database file.
     * @returns This DatabaseManager.
     */
    init(path: string) {
        this.#path = path;
        this.#initialising = true;

        // create tables if required
        this.operation(db => {
            this.#tableDefinitions.forEach(x => {
                db.exec(`CREATE TABLE IF NOT EXISTS ${x}`);
            });
        });

        this.#initialising = false;
        this.#ready = true;
        return this;
    }

    /**
     * Run a function on the database.
     * @param f The function to run on the database.
     * @returns The result of the function.
     */
    operation<F extends (db: Database) => any>(f: F): ReturnType<F> {
        if (!this.#ready && !this.#initialising) throw new Error("This database manager has not been initialised.");
        // load db
        let db = betterSQLite3(this.#path);
        let output: any;
        try {
            db.transaction(() => {
                output = f(db);
            })();
        } catch (e: any) {
            db.close();
            throw e;
        }
        db.close();
        return output;
    }
}

export class Databases {
    static Data = new DatabaseManager();
}
