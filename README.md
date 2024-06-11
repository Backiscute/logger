# Back's logger
Join my [discord server](https://discord.gg/xmwHqshYHF) or visit [my website](https://back.rs).
## What's this?
It's a package that facilitates logging to console by allowing you to add many different loggers and styles. Also provides you with a progress bar and table out of the box. Works out of the box with no configuration needed.
Uses under the hood:
- winston
- colorette
- strip-ansi
- progress
- table
- moment
## Usage examples
> JS
```js
    const createLogger = require("@backs/logger")

    const logger = createLogger()

    logger.log("Test\n%bl_b", "This text is blue in bold.")
    /* Prints
        Test
        This text is blue in bold.
    /*
```
> TS
```ts
    import createLogger from "@backs/logger"

    const logger = createLogger()

    logger.log("Test\n%bl_b", "This text is blue in bold.")
    /* Prints
        Test
        This text is blue in bold.
    /*
```
## Customization
Since it uses *winston* under the hood, you can use custom levels, colors, handlers, transports. You can also disable colors if needed.
Check *options* down below.
## Options
- `levels`?: `string[]` - Array of winstom levels from most important to least important. Defaults to `["error", "warn", "debug", "log", "info"]`.
- `colors`?: `Record<string, Color>` - An object that contains a function that takes a string or number and returns a string, for each log level. Defaults to `{ error: red, warn: yellow, debug: magenta, log: blue, info: green }`.
- `transports`?: `transports[]` - Array of winston transports. Defaults to a `Console` transport and `File` transport *(error level only)* with custom formats.
- `handlers`?: `Record<string, (logger: WinstonLogger, message: any, ...args: any[]) => void>` - An object containing objects for each level containing a function to handle that level. Provides the winston logger, a message which can be any type, and an array of arguments.
- `disableColors`?: `boolean` - Whether or not to disable colors in the console.
## Color & Modifiers
You can pass into the message argument replacements formated as such `%color_modifiers`. These will be replaced by the arguments in order.
Both the color and the modifiers are optional.
- Color only:
`%b`
- Modifier only:
`%_u`
- Color and modifier:
`%b_u`
- Multiple modifiers:
`%b_u,s`
### All possible colors
```ts
{
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
```
### All possible modifiers
```ts
{
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
```
### NOTE:
You can only pass one color unlike modifiers which can be stacked by seperating them with a comma.
## Additional Methods & Properties
- `resolveLevel`: Method - This just returns the level you want but padded by spaces so all levels are the same length.
- `color`: Method - Takes a function that takes a string or number and returns a string. It either applies the color to the string or returns it as is depending on whether or not colors are disabled.
- `stringifyArg`: Method - Stringifies whatever you pass into it.
- `formatArgs`: Method - Takes a message as the first argument and an array of arguments as the second one. This is the function that handles all colors and modifiers.
- `table`: Method - Creates a table. Documentation available [here](https://www.npmjs.com/package/table).
- `createTableStream`: Method - Creates a table stream. Documentation available [here](https://www.npmjs.com/package/table).
- `progress`: Method - Creates a progress bar. Documentation available [here](https://www.npmjs.com/package/progress).
- `isColorEnabled`: Property - Returns a boolean that indicates whether colors are enabled or not.
- `logger`: Property - Returns the winston logger used under the hood.