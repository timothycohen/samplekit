export namespace Log {
	export type Lvl = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
	// What the user can pass in
	export type Raw = string | Error | Record<string, unknown>;
	// The internal storage format is always a record
	export type Obj = { msg?: string[]; err?: Error } & Record<string, unknown>;
	export type MergeFn = (a: Obj, b: Obj) => Obj;
}

export type LoggerProps = {
	enabled?: boolean;
	base?: Log.Raw;
	write?: (a: { lvl: number; log: Log.Obj }) => void;
	mergeFn?: Log.MergeFn;
};

export interface ILogger {
	readonly write: (a: { lvl: number; log: Log.Obj }) => void;
	enabled: boolean;
	getBaseShallowCopy: () => Log.Obj;
	log: ({ lvl, log }: { lvl: number | Log.Lvl; log: unknown }) => void;
	trace: (log: unknown) => void;
	debug: (log: unknown) => void;
	info: (log: unknown) => void;
	warn: (log: unknown) => void;
	error: (log: unknown) => void;
	fatal: (log: unknown) => void;
	child: (a?: LoggerProps) => ILogger;
}
