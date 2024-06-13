import { Color } from "colorette";
import { transport, Logger as WinstonLogger } from "winston"
import { Logger } from ".";

export interface LoggerOptions<T extends string[]> {
    levels?: T;
    colors?: Record<T[number], Color>;
    transports?: transport[];
    log?: Record<T[number], boolean | (() => boolean)>;
    handlers?: Record<T[number], (logger: WinstonLogger, message: any, ...args: any[]) => void>;
    disableColors?: boolean;
}

export type TypedLogger<T extends string[]> = Logger<T> & {
    [K in T[number]]: (message: any, ...args: any[]) => TypedLogger<T>;
};