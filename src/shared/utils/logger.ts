import { HttpService, RunService } from "@rbxts/services";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
    showTimestamp: boolean;
    showLevel: boolean;
    emoji: boolean;
    nsPad: number; // pad [namespace] to fixed width for readability
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const LEVEL_ICON: Record<LogLevel, string> = { debug: "🐛", info: "ℹ️", warn: "⚠️", error: "✖" };
const LEVEL_TAG: Record<LogLevel, string> = { debug: "DBG", info: "INF", warn: "WRN", error: "ERR" };

let currentLevel: LogLevel = RunService.IsStudio() ? "debug" : "warn";
let globalOptions: LoggerOptions = {
    showTimestamp: true,
    showLevel: true,
    emoji: RunService.IsStudio(),
    nsPad: 18,
};

// --- Minimal Ring Buffer for Recent Logs (Dev Diagnostics) --------------------
const RECENT_CAP = 400; // tweakable; sized to be lightweight
const recentLogs = new Array<string>();

function pushRecent(line: string) {
    recentLogs.push(line);
    if (recentLogs.size() > RECENT_CAP) {
        // remove oldest (index 0)
        recentLogs.remove(0);
    }
}

export function getRecentLogs(limit = 100): string[] {
    if (limit <= 0) return [];
    const size = recentLogs.size();
    if (size <= limit) return [...recentLogs];
    const sliceStart = size - limit;
    const out: string[] = [];
    for (let i = sliceStart; i < size; i++) out.push(recentLogs[i]);
    return out;
}

export function clearRecentLogs() {
    while (recentLogs.size() > 0) recentLogs.remove(0);
}

export function setLogLevel(level: LogLevel) {
    currentLevel = level;
}
export function getLogLevel(): LogLevel { return currentLevel; }
export function configureLogger(opts: Partial<LoggerOptions>) {
    globalOptions = { ...globalOptions, ...opts };
}

function shouldLog(level: LogLevel) { return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel]; }

function padNamespace(ns: string, width: number): string {
    const len = ns.size();
    if (len >= width) return ns;
    return `${ns}${string.rep(" ", width - len)}`;
}

function formatTime(): string {
    // HH:MM:SS local time
    const s = os.date("%H:%M:%S");
    return s ? s : tostring(os.time());
}

function safeEncode(val: unknown): string | undefined {
    if (typeIs(val, "table")) {
        const [ok, encoded] = pcall(() => HttpService.JSONEncode(val as defined));
        if (ok) return encoded;
    }
    return undefined;
}

function buildPrefix(level: LogLevel, ns: string, opts: LoggerOptions): string {
    const icon = opts.emoji ? LEVEL_ICON[level] : LEVEL_TAG[level];
    const lvl = opts.showLevel ? icon : "";
    const time = opts.showTimestamp ? formatTime() : "";
    const nsPart = `[${opts.nsPad > 0 ? padNamespace(ns, opts.nsPad) : ns}]`;
    // Assemble: "HH:MM:SS ICON [namespace]"
    return `${time ? `${time} ` : ""}${lvl ? `${lvl} ` : ""}${nsPart}`;
}

function emit(level: LogLevel, ns: string, args: unknown[], opts: LoggerOptions) {
    const prefix = buildPrefix(level, ns, opts);
    // Best-effort JSON for plain tables (without touching Instances, userdata, etc.)
    let outArgs = args;
    if (args.size() === 1) {
        const enc = safeEncode(args[0]);
        if (enc !== undefined) outArgs = [enc];
    }
    if (level === "warn" || level === "error") {
        warn(prefix, ...outArgs);
    } else {
        print(prefix, ...outArgs);
    }

    // Capture simplified line into ring buffer (strip tables already JSON encoded above)
    // Avoid heavy processing; assemble a lightweight string.
    const renderedParts = new Array<string>();
    for (const v of outArgs) {
        renderedParts.push(typeOf(v) === "string" ? (v as string) : tostring(v));
    }
    const rendered = `${prefix} ${renderedParts.join(" ")}`;
    pushRecent(rendered);
}

export function createLogger(namespace: string, options?: Partial<LoggerOptions>) {
    const onceKeys = new Set<string>();
    const opts: LoggerOptions = { ...globalOptions, ...(options ?? {}) };
    // mutable copy for setOptions without using any
    let mutableOpts = opts;

    const log = (level: LogLevel) => (...args: unknown[]) => {
        if (!shouldLog(level)) return;
        emit(level, namespace, args, opts);
    };

    const api = {
        debug: log("debug"),
        info: log("info"),
        warn: log("warn"),
        error: log("error"),
        warnOnce: (key: string, ...args: unknown[]) => {
            const k = `${namespace}:${key}`;
            if (onceKeys.has(k)) return;
            onceKeys.add(k);
            if (!shouldLog("warn")) return;
            emit("warn", namespace, args, opts);
        },
        banner: (title: string, level: LogLevel = "info") => {
            if (!shouldLog(level)) return;
            const line = string.rep("━", math.max(10, opts.nsPad + 10));
            const head = `┏${line}`;
            const tail = `┗${line}`;
            emit(level, namespace, [title], opts);
            if (opts.emoji || opts.showLevel || opts.showTimestamp) {
                // Add top/bottom lines around banner content
                if (level === "warn" || level === "error") warn(head); else print(head);
                if (level === "warn" || level === "error") warn(tail); else print(tail);
            }
        },
        child: (suffix: string) => createLogger(`${namespace}:${suffix}`, options),
        setOptions: (o: Partial<LoggerOptions>) => { mutableOpts = { ...mutableOpts, ...o }; },
        getOptions: () => mutableOpts,
    } as const;

    return api;
}
