export namespace Log {
	export type Lvl = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
	// What the user can pass in
	export type Raw = string | Error | Record<string, unknown>;
	// The internal storage format is always a record
	export type Obj = { msg?: string[]; err?: Error } & Record<string, unknown>;
	export type MergeFn = (a: Obj, b: Obj) => Obj;
}

const isRecord = (o: unknown): o is Record<string, unknown> => typeof o === 'object' && o !== null && !Array.isArray(o);

type LoggerProps = {
	enabled?: boolean;
	base?: Log.Raw;
	write?: (a: { lvl: number; log: Log.Obj }) => void;
	mergeFn?: Log.MergeFn;
};

/**
 * ## A logger that supports base data, disabling, child loggers, and custom write functions
 *
 * ### Input Types: `string | Error | Record<string, unknown>`
 *
 * #### `string` and `{ msg: string }` are equivalent
 * ```ts
 * const logger = new Logger()
 * logger.info('hello') // hello
 * logger.info({ msg: 'hello' }) // hello
 * ```
 *
 * #### `Error` and `{ err: Error }` are equivalent
 * ```ts
 * logger.error(new Error('ahh!'))
 * logger.error({ err: new Error('ahh!') })
 * ```
 *
 * #### Record<string, unknown> can be used to pass in any data
 * ```ts
 * logger.info({ context: { env: 'development' }, msg: 'hello' }); // { context: { env: 'development' }, msg: 'hello' }
 * ```
 *
 * ### Base Data
 * Define base data to be included in every log
 * ```ts
 * const logger = new Logger({ base: { context: { env: 'development' } } });
 * logger.info('hello'); // { context: { env: 'development' }, msg: 'hello' }
 * ```
 *
 * ### Disabling
 * ```ts
 * logger.info('hello') // hello
 * logger.enabled = false;
 * logger.info('hello') // nothing
 * ```
 * ### Child Loggers
 *
 * Child loggers can be used to add additional base data, or change the settings (mergeFn, enabled, write)
 *
 * ```ts
 * const logger = new Logger({ base: { context: { env: 'development' } } });
 * const child = logger.child({ base: { browser: true } } });
 * child.info('hello'); // { context: { env: 'development' }, browser: true, msg: 'hello' }
 * ```
 *
 * #### Merging is supported for base/child data
 * - The logger accepts an optional merge function, which accepts an optional list of keys to merge.
 * - The default merge function only concatenates the msg key by default. All other keys are overwritten.
 *
 * ```ts
 * const logger = new Logger({
 * 	base: {
 * 		overwrittenString: 'parent',
 * 		overwrittenObj: { first: 'homer' },
 * 		overwrittenArray: [1],
 * 		status: 200,
 * 		msg: 'Hello ',
 * 	},
 * });
 *
 * logger.info({
 * 	overwrittenString: 'child',
 * 	overwrittenObj: { last: 'simpson' },
 * 	overwrittenArray: [2],
 * 	browser: true,
 * 	msg: 'world',
 * });
 *
 * // {
 * // 	overwrittenString: 'child',
 * // 	overwrittenObj: { last: 'simpson' },
 * // 	overwrittenArray: [ 2 ],
 * // 	status: 200,
 * // 	browser: true,
 * // 	msg: 'Hello world'
 * // }
 *```
 *
 * Override this behavior by passing in a custom mergeFn.
 * - `Logger.createDefaultMergeFn` can be used with a list of string keys to merge. If the values of both keys are the same type, they will be merged (strings will be concatenated, arrays will be concatenated, objects will be spread in).
 * - If the values are different types, the child value will overwrite the parent value (as if the key wasn't there).
 * ```ts
 * // mergeFn: Logger.createDefaultMergeFn([]),
 * // {
 * // 	overwrittenString: 'child',
 * // 	overwrittenObj: { last: 'simpson' },
 * // 	overwrittenArray: [ 2 ],
 * // 	status: 200,
 * // 	browser: true,
 * // 	msg: 'world'
 * // }
 * ```
 * Or add other keys
 * ```ts
 * // mergeFn: Logger.createDefaultMergeFn(['msg', 'overwrittenString', 'overwrittenObj', 'overwrittenArray']),
 * // {
 * // 	overwrittenString: 'parentchild',
 * // 	overwrittenObj: { first: 'homer', last: 'simpson' },
 * // 	overwrittenArray: [ 1, 2 ],
 * // 	status: 200,
 * // 	browser: true,
 * // 	msg: 'Hello world'
 * // }
 * ```
 *
 * ### The default write function will print a string if 'msg' is the only key, otherwise it will print the object
 *   ```ts
 * logger.info({ msg: 'hello' }); // hello
 * logger.info({ context: { env: 'development' }, msg: 'hello' }); // { context: { env: 'development' }, msg: 'hello' }
 * ```
 *
 * ### To customize this, provide your own write function
 * ```ts
 * const logger = new Logger({ write: ({ lvl, log }) => {
 *   if (lvl >= 50) sendToErrorService({lvl, log});
 *   if (lvl >= consoleThreshold) Logger.writeToConsole({ lvl, log });
 *   if (!dev) sendToPersistentStorage({lvl, log});
 *   }
 * });
 * ```
 */

export class Logger {
	static readonly levels = Object.freeze(['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const);

	static lvlNumToStr(n: number): Log.Lvl {
		if (typeof n !== 'number') return 'info';
		if (n < 20) return 'trace';
		if (n < 30) return 'debug';
		if (n < 40) return 'info';
		if (n < 50) return 'warn';
		if (n < 60) return 'error';
		return 'fatal';
	}

	static toConsoleLvl(n: number): 'log' | 'info' | 'warn' | 'error' {
		if (n < 30) return 'log';
		if (n < 40) return 'info';
		if (n < 50) return 'warn';
		return 'error';
	}

	static lvlStrToNum(l: string): number {
		if (l === 'trace') return 10;
		if (l === 'debug') return 20;
		if (l === 'info') return 30;
		if (l === 'warn') return 40;
		if (l === 'error') return 50;
		if (l === 'fatal') return 60;
		return 30;
	}

	static toLvlNum(l: Log.Lvl | number): number {
		if (typeof l === 'string') return Logger.lvlStrToNum(l);
		return l;
	}

	static toObj(raw: unknown): Log.Obj {
		if (typeof raw === 'string') return { msg: [raw] };
		if (raw instanceof Error) return { err: raw };
		else if (isRecord(raw)) {
			if (raw['msg'] && typeof raw['msg'] === 'string') return { ...raw, msg: [raw['msg']] };
			else return raw;
		} else return {};
	}

	static isEmpty(o: Record<string, unknown>): boolean {
		return Object.keys(o).length === 0;
	}

	static hide({ mut_log, hiddenKeys }: { mut_log: Log.Obj; hiddenKeys?: string[] }): Log.Obj {
		if (Logger.isEmpty(mut_log) || !hiddenKeys || !Array.isArray(hiddenKeys) || hiddenKeys.length === 0) return mut_log;
		for (const key of hiddenKeys) delete mut_log[key];
		return mut_log;
	}

	static extractTimestamp = <T extends Log.Obj>({
		mut_log,
	}: {
		mut_log: T;
	}): {
		timestamp: number;
		raw?: number;
		data: T & { ts?: never };
	} => {
		const val = mut_log['ts'];
		const raw =
			typeof val === 'number' && !isNaN(val)
				? val
				: val instanceof Date
					? val.getTime()
					: typeof val === 'string'
						? Date.parse(val)
						: undefined;

		delete mut_log['ts'];
		const timestamp = raw ?? Date.now();
		return { timestamp, raw, data: mut_log as T & { ts?: never } };
	};

	static extractMsg<T extends Log.Obj>({
		mut_log,
	}: {
		mut_log: T;
	}): {
		msg?: string;
		raw?: string[];
		data: T & { msg?: never };
	} {
		const raw = mut_log.msg;
		delete mut_log.msg;
		const msg = raw?.join('');
		return { msg, raw, data: mut_log as T & { msg?: never } };
	}

	static extractErr<T extends Log.Obj>({
		mut_log,
	}: {
		mut_log: T;
	}): {
		err?: { name: string; message: string; stack?: string };
		raw?: Error;
		data: T & { err?: never };
	} {
		const raw = mut_log.err instanceof Error ? mut_log.err : undefined;
		delete mut_log.err;
		const err = raw ? { name: raw.name, message: raw.message, stack: raw.stack } : undefined;
		return { err, raw, data: mut_log as T & { err?: never } };
	}

	static consoleFormatter = ({
		mut_log,
		hiddenKeys,
	}: {
		mut_log: Log.Obj;
		hiddenKeys?: string[];
	}): {
		msg?: string;
		data: Record<string, unknown> & { msg?: never };
	} | null => {
		const visible = Logger.hide({ mut_log, hiddenKeys });
		if (Logger.isEmpty(visible)) return null;
		const { data, msg } = Logger.extractMsg({ mut_log: visible });
		return { data, msg };
	};

	static writeToConsole = (a: { lvl: number; log: Log.Obj }): void => {
		const formatted = Logger.consoleFormatter({ mut_log: { ...Logger.toObj(a.log) } });
		if (!formatted) return;

		const lvl = a.lvl;
		const { data, msg } = formatted;
		const hasData = !Logger.isEmpty(data);
		if (!msg && !hasData) return;

		const d = msg && !hasData ? msg : !msg && hasData ? data : { ...data, msg };
		// eslint-disable-next-line no-console
		return console[Logger.toConsoleLvl(lvl)](d);
	};

	static createDefaultMergeFn(mergeKeys: string[] = ['msg']): Log.MergeFn {
		return (a, b) => {
			const res: Log.Obj = { ...a, ...b };

			for (const key of mergeKeys) {
				const valA = a[key];
				const valB = b[key];
				if (typeof valA === 'string' && typeof valB === 'string') {
					res[key] = valA + valB;
				} else if (Array.isArray(valA) && Array.isArray(valB)) {
					res[key] = [...valA, ...valB];
				} else if (isRecord(valA) && isRecord(valB)) {
					res[key] = { ...valA, ...valB };
				}
			}

			return res;
		};
	}

	private _enabled;
	private readonly base: Log.Obj;
	readonly write: (a: { lvl: number; log: Log.Obj }) => void;
	private mergeFn: Log.MergeFn;

	constructor({ enabled, base, write, mergeFn }: LoggerProps = {}) {
		if (typeof enabled === 'boolean') this._enabled = enabled;
		else this._enabled = true;

		if (base) this.base = Logger.toObj(base);
		else this.base = {};

		if (typeof write === 'function') this.write = write;
		else this.write = Logger.writeToConsole;

		if (typeof mergeFn === 'function') this.mergeFn = mergeFn;
		else this.mergeFn = Logger.createDefaultMergeFn();
	}

	get enabled() {
		return this._enabled;
	}
	set enabled(v: boolean) {
		this._enabled = !!v;
	}

	getBaseShallowCopy(): Log.Obj {
		return { ...this.base };
	}

	log({ lvl, log }: { lvl: number | Log.Lvl; log: unknown }) {
		if (this._enabled) {
			this.write({ lvl: Logger.toLvlNum(lvl), log: this.mergeFn(this.base, Logger.toObj(log)) });
		}
	}

	trace = (log: unknown) => this.log({ lvl: 'trace', log });
	debug = (log: unknown) => this.log({ lvl: 'debug', log });
	info = (log: unknown) => this.log({ lvl: 'info', log });
	warn = (log: unknown) => this.log({ lvl: 'warn', log });
	error = (log: unknown) => this.log({ lvl: 'error', log });
	fatal = (log: unknown) => this.log({ lvl: 'fatal', log });

	child(a: LoggerProps = {}) {
		const mergeFn = a.mergeFn ?? this.mergeFn;
		const base = a.base ? mergeFn(this.base, Logger.toObj(a.base)) : this.base;
		const enabled = a.enabled ?? this._enabled;
		const write = a.write ?? this.write;
		return new Logger({ mergeFn, base, enabled, write });
	}
}
