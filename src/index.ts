import { createLogger as createWinstonLogger, Logger as WinstonLogger, format, transports } from "winston";
import {
    Color, isColorSupported,
    black, bgBlack, blackBright, bgBlackBright, dim,
    red, bgRed, redBright, bgRedBright, bold,
    green, bgGreen, greenBright, bgGreenBright, hidden,
    yellow, bgYellow, yellowBright, bgYellowBright, italic,
    blue, bgBlue, blueBright, bgBlueBright, underline,
    magenta, bgMagenta, magentaBright, bgMagentaBright, strikethrough,
    cyan, bgCyan, cyanBright, bgCyanBright, reset,
    white, bgWhite, whiteBright, bgWhiteBright, gray
} from "colorette";
import { LoggerOptions, TypedLogger } from "./typings";
import { table, createStream as createTableStream, TableUserConfig, StreamUserConfig } from "table";
import progress from "progress";
import moment from "moment";

const stripAnsi = (str: string) => str.replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g, "");

export const colorMap = {
    b: black,
    bb: bgBlack,
    bbr: blackBright,
    bbbr: bgBlackBright,
    r: red,
    br: bgRed,
    rbr: redBright,
    brbr: bgRedBright,
    g: green,
    bg: bgGreen,
    gbr: greenBright,
    bgbr: bgGreenBright,
    y: yellow,
    by: bgYellow,
    ybr: yellowBright,
    bybr: bgYellowBright,
    bl: blue,
    bbl: bgBlue,
    blbr: blueBright,
    bblbr: bgBlueBright,
    m: magenta,
    bm: bgMagenta,
    mbr: magentaBright,
    bmbr: bgMagentaBright,
    c: cyan,
    bc: bgCyan,
    cbr: cyanBright,
    bcbr: bgCyanBright,
    w: white,
    bw: bgWhite,
    wbr: whiteBright,
    bwbr: bgWhiteBright,
    gr: gray,
    black: black,
    bgBlack: bgBlack,
    blackBright: blackBright,
    bgBlackBright: bgBlackBright,
    red: red,
    bgRed: bgRed,
    redBright: redBright,
    bgRedBright: bgRedBright,
    green: green,
    bgGreen: bgGreen,
    greenBright: greenBright,
    bgGreenBright: bgGreenBright,
    yellow: yellow,
    bgYellow: bgYellow,
    yellowBright: yellowBright,
    bgYellowBright: bgYellowBright,
    blue: blue,
    bgBlue: bgBlue,
    blueBright: blueBright,
    bgBlueBright: bgBlueBright,
    magenta: magenta,
    bgMagenta: bgMagenta,
    magentaBright: magentaBright,
    bgMagentaBright: bgMagentaBright,
    cyan: cyan,
    bgCyan: bgCyan,
    cyanBright: cyanBright,
    bgCyanBright: bgCyanBright,
    white: white,
    bgWhite: bgWhite,
    whiteBright: whiteBright,
    bgWhiteBright: bgWhiteBright,
    gray: gray
}

export const modifiersMap = {
    d: dim,
    h: hidden,
    i: italic,
    u: underline,
    s: strikethrough,
    b: bold,
    r: reset,
    dim: dim,
    hidden: hidden,
    italic: italic,
    underline: underline,
    strikethrough: strikethrough,
    bold: bold,
    reset: reset
}

export const argumentRegex = /%(?<color>[A-Z]+)?(?:_(?<modifiers>[A-Z]+(,[A-Z])*))?/ig

export default function createLogger<T extends string[] = ["error", "warn", "debug", "log", "info"]>(options?: LoggerOptions<T>) {
    return new Logger(options) as TypedLogger<T>;
}

export class Logger<T extends string[] = ["error", "warn", "debug", "log", "info"]> {
    private colorEnabled = true;
    private options: LoggerOptions<T>;
    public logger: WinstonLogger;
    get isColorEnabled() {
        return this.colorEnabled;
    }

    constructor(options?: LoggerOptions<T>) {
        this.options = options ?? {};
        this.colorEnabled = process.env.NO_COLOR && process.env.NO_COLOR !== "" ? false : isColorSupported ? !(this.options.disableColors ?? false) : false;
        if (!this.options.levels) { 
            this.options.log ??= { debug: () => process.env.NODE_ENV === "debug" } as Record<T[number], boolean | (() => boolean)>;
            this.options.log["debug"] ??= () => process.env.NODE_ENV === "debug";
        }
        this.options.levels ??= Object.keys(this.DEFAULT_LEVELS) as T;
        this.options.colors ??= this.DEFAULT_COLORS as Record<T[number], Color>;
        this.options.transports ??= this.DEFAULT_TRANSPORTS;
        this.logger = createWinstonLogger({
            levels: this.options.levels.reduce((acc, level, index) => ({ ...acc, [level === "log" ? "syslog" : level]: index }), {} as Record<T[number], number>),
            transports: this.options.transports
        });

        const shouldLog = (b: boolean | (() => boolean)) => typeof b === "function" ? b() : b;
        
        for (const level of this.options.levels) {
            this[level] = (this.options.handlers?.[level] ? ((message: any, ...args: any[]) => {
                if (!shouldLog(this.options.log?.[level] ?? true)) return;
                this.options.handlers?.[level](this.logger[level === "log" ? "syslog" : level], message, ...args);
            }) : undefined) ?? ((message: any, ...args: any[]) => {
                if (!shouldLog(this.options.log?.[level] ?? true)) return;
                message = this.formatArgs(this.stringifyArg(message), args);
                this.logger[level === "log" ? "syslog" : level]({
                    message: message,
                    rawMessage: stripAnsi(message)
                });
            })
        }
    }

    private DEFAULT_LEVELS = {
        error: 0,
        warn: 1,
        debug: 2,
        log: 3,
        info: 4
    }

    private DEFAULT_COLORS = {
        error: red,
        warn: yellow,
        debug: magenta,
        log: blue,
        info: green
    }
    
    private DEFAULT_FORMAT = format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${this.color(gray, moment(timestamp).format("MM/DD/YYYY HH:mm:ss z"))} ${this.color(this.DEFAULT_COLORS[level === "syslog" ? "log" : level], this.resolveLevel(level))}: ${message}`;
        })
    );
    
    private DEFAULT_FILEFORMAT = format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, rawMessage }) => {
            return JSON.stringify({
                timestamp,
                level: level,
                message: rawMessage
            })
        })
    );

    private DEFAULT_TRANSPORTS = [
        new transports.Console({
            format: this.DEFAULT_FORMAT
        }),
        new transports.File({ level: "error", format: this.DEFAULT_FILEFORMAT, filename: "logs/errors.log" })
    ]

    /**
     * Documentation available [here](https://www.npmjs.com/package/table).
     */
    table(data: unknown[][], config?: TableUserConfig) {
        console.log(table(data, config))
    }

    /**
     * Documentation available [here](https://www.npmjs.com/package/table).
     */
    createTableStream(config: StreamUserConfig) {
        return createTableStream(config)
    }

    /**
     * Documentation available [here](https://www.npmjs.com/package/progress).
     */
    progress(format: string, total: number) {
        return new progress(format, total)
    }

    color(color: Color, text: string) {
        return this.colorEnabled ? color(text) : text;
    }

    resolveLevel(level: string) {
        const longest = Math.max(...this.options.levels!.map(l => `[${l === "syslog" ? "log" : l}]`.length))
        return `[${level === "syslog" ? "log" : level}]`.padEnd(longest, " ")
    }

    stringifyArg(arg: any) {
        if (arg instanceof Error) {
            let msg = `${arg.name}: ${arg.message}`
            if (arg.stack) msg += `\n${arg.stack.replace(`${arg.toString()}\n`, "")}`
            if (arg.cause) msg += `\nCaused by: ${this.stringifyArg(arg.cause)}`
            return msg;
        }

        if (typeof arg === "object") {
            return JSON.stringify(arg, null, 4);
        }

        if (Array.isArray(arg)) {
            return arg.map(a => this.stringifyArg(a)).join(", ");
        }

        return arg.toString();
    }

    formatArgs(message: string, args: any[]) {
        const matchedArguments = message.match(argumentRegex);
        if (!matchedArguments) return message;

        for (const match of matchedArguments) {
            argumentRegex.lastIndex = 0;
            const { color, modifiers } = argumentRegex.exec(match)?.groups ?? {};
            if (!color && !modifiers) continue;
            const colorFn = colorMap[color as (keyof typeof colorMap)];
            let text = this.stringifyArg(args.shift());
            if (colorFn) text = this.color(colorFn, text);
            if (modifiers) {
                const modifierFns = modifiers.split(",").map(modifier => modifiersMap[modifier as (keyof typeof modifiersMap)]).filter((v,i,a) => a.indexOf(v) === i);
                text = modifierFns.reduce((acc, modifier) => modifier(acc), text);
            }
            message = message.replace(match, text);
        }

        return message;
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `Logger <Color ${this.colorEnabled ? "enabled" : "disabled"}>`
    }
}

export * from "./typings";