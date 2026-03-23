# People counter server

## Development usage

1. Configure the `.env` file following the format in [.env.example](.env.example).

2. Install dependencies

    ```bash
    npm i
    ```

3. Start the development version of the server with

    ```bash
    npm run dev
    ```

    This will watch the `src/` folder and `server.ts` files, and restart the program on any changes to source code.

## Notes

### Logging

When logging, import functions from `src/managers/LoggingManager.ts` as follows:

```ts
import LoggingManager from "./src/managers/LoggingManager.js";
const { debug, info, warn, error, critical } = LoggingManager;

debug("This is a debug message! It will appear in the console only.");
info("This is an info message! It will appear in the console and the log file.");
warn("Oh no it's a warning");

try {
    throw new Error("aha i'm an error");
} catch (e: any) {
    error("oh no there was an error:", e);
    critical("oh no there was a really bad error:", e);
}
```
