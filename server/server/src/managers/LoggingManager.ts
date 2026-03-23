import winston, { type LeveledLogMethod, type Logger } from "winston";
import { userInfo } from "node:os";
import { format as prettyFormat } from "pretty-format";

export type LoggerLevel = "debug" | "info" | "warn" | "error" | "critical";

type LoggerConsoleSettings = {
    level: LoggerLevel;
};

type LoggerFileSettings = {
    level: LoggerLevel;
};

export type LoggerSettings = {
    console: LoggerConsoleSettings;
    file: LoggerFileSettings;
};

export default class LoggingManager {
    /**
     * Reference to a Winston logger
     * @static
     * @private
     */
    static #logger: Logger & Record<LoggerLevel, LeveledLogMethod>;

    /**
     * Create, set up and return a Winston logger.
     * @param settings The path of the settings file to use.
     * @returns The created logger.
     */
    static createLogger(settings: LoggerSettings): Logger & Record<LoggerLevel, LeveledLogMethod> {
        console.log(`[${new Date().toDateString()} ${new Date().toTimeString()}] Setting up logger...`);

        const logger = winston.createLogger({
            // setup transports
            transports: [
                // console
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize({
                            all: true
                        })
                    ),
                    // send messages down to level specified
                    level: settings.console.level
                }),
                // file
                new winston.transports.File({
                    // ensure all filenames are unique
                    filename: `logs/${process.env.npm_package_name}-${new Date().getUTCFullYear()}.${new Date().getUTCMonth() + 1}.${new Date().getUTCDate()}-${new Date().valueOf()}.log`,
                    // send messages down to level specified
                    level: settings.file.level
                })
            ],
            levels: {
                critical: 0,
                error: 1,
                warn: 2,
                info: 3,
                debug: 4
            },
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({
                    format: "YYYY/MM/DD, HH:mm:ss"
                }),
                winston.format.errors({
                    stack: true,
                }),
                // prepare for long line
                winston.format.printf(({ level, message, stack, timestamp }) =>
                    `[${level.toUpperCase()}] ${timestamp}\t» ${typeof message == "string" ? message.replace(new RegExp(userInfo().username, "g"), "X") : "\n" + prettyFormat(message).replace(new RegExp(userInfo().username, "g"), "X")}${stack ? `\n${(stack as string).replace(new RegExp(userInfo().username, "g"), "X")}` : ""}`
                )
            )
        }) as winston.Logger & Record<LoggerLevel, LeveledLogMethod>;

        // setup colours
        winston.addColors({
            critical: "bold red whiteBG",
            error: "bold red blackBG",
            warn: "bold yellow blackBG",
            info: "cyan blackBG",
            debug: "grey blackBG"
        });

        // is this a horrendous idea? yes.
        // am i going to do it anyway? also yes.
        process.on("uncaughtException", e => {
            logger.critical("Uncaught exception:", e);
        });

        logger.info("Logging setup.");

        LoggingManager.#logger = logger;
        return logger;
    }

    /**
     * Log at debug level.
     * @param x The content to log.
     * @param e An error associated with the message.
     */
    public static debug = (x: string, e?: object): void => { LoggingManager.#logger.debug(x, e); };
    /**
     * Log at info level.
     * @param x The content to log.
     * @param e An error associated with the message.
     */
    static info = (x: string, e?: object): void => { LoggingManager.#logger.info(x, e); };
    /**
     * Log at warn level.
     * @param x The content to log.
     * @param e An error associated with the message.
     */
    static warn = (x: string, e?: object): void => { LoggingManager.#logger.warn(x, e); };
    /**
     * Log at error level.
     * @param x The content to log.
     * @param e An error associated with the message.
     */
    static error = (x: string, e?: object): void => { LoggingManager.#logger.error(x, e); };
    /**
     * Log at critical level.
     * @param x The content to log.
     * @param e An error associated with the message.
     */
    static critical = (x: string, e?: object): void => { LoggingManager.#logger.critical(x, e); };
}
