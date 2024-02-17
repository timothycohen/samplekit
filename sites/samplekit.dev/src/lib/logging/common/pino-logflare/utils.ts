type Payload = Record<string, unknown>;

export type IngestTransformsI = {
	numbersToFloats: boolean;
};

export type LogflareUserOptionsI = {
	sourceToken: string;
	apiKey: string;
	apiBaseUrl?: string;
	transforms?: IngestTransformsI;
	endpoint?: string;
	fromBrowser?: boolean;
	onError?: ((payload: { batch: object[] }, err: Error) => void) | undefined;
};

type PayloadMeta = {
	cleanedPayload: Payload;
	message?: string;
	level?: string;
	timestamp?: string;
	context: {
		host?: string;
		service?: string;
		pid?: string;
		stack?: string;
		type?: string;
	};
};

function isObject(value?: unknown): value is object {
	return typeof value === 'object' && value !== null;
}

function isString(value?: unknown): value is string {
	return typeof value === 'string';
}

/**
 * Takes an object and removes all falsy properties
 */
function removeFalsy<TInput>(input: TInput): TInput {
	if (input === null || input === undefined) {
		return input;
	}

	if (typeof input === 'object' && input !== null) {
		let key: keyof typeof input;

		for (key in input) {
			const value = input[key];

			if (!value) {
				delete input[key];
			} else if (typeof value === 'object') {
				removeFalsy(value);

				if (!Object.keys(value).length) {
					delete input[key];
				}
			}
		}
	}

	return input;
}

function levelToStatus(level: unknown) {
	if (typeof level !== 'number') return 'info';

	if (level === 10 || level === 20) {
		return 'debug';
	}
	if (level === 40) {
		return 'warning';
	}
	if (level === 50) {
		return 'error';
	}
	if (level >= 60) {
		return 'critical';
	}
	return 'info';
}

type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type SerializerFn = (value: unknown) => unknown;

type Bindings = {
	level?: Level | string;
	serializers?: { [key: string]: SerializerFn };
	[key: string]: unknown;
};

type LogEvent = {
	ts: number;
	messages: unknown[];
	bindings: Bindings[];
	level: {
		label: string;
		value: number;
	};
};

const formatPinoBrowserLogEvent = (logEvent: LogEvent) => {
	const {
		ts,
		messages,
		bindings,
		level: { value: levelValue },
	} = logEvent;
	const level = levelToStatus(levelValue);
	const timestamp = ts;
	const objMessages = messages.filter(isObject) as unknown as Bindings;
	const strMessages = messages.filter(isString);
	const logEntry = strMessages.join(' ');
	const defaultMetadata = {
		url: getDocumentUrl(),
		level: level,
		browser: true,
	};
	const bindingsAndMessages = bindings.concat(objMessages);
	const metadata = bindingsAndMessages.reduce((acc, el) => {
		return Object.assign(acc, el);
	}, defaultMetadata);

	return {
		metadata,
		log_entry: logEntry,
		timestamp,
	};
};

function getDocumentUrl(): string | undefined {
	if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
		return window.document.URL;
	}
}

function addLogflareTransformDirectives(item: Payload, options: LogflareUserOptionsI): Payload {
	if (options?.transforms?.numbersToFloats) {
		return {
			...item,
			'@logflareTransformDirectives': { numbersToFloats: true },
		};
	} else {
		return item;
	}
}

const extractPayloadMeta = (item: Payload) => {
	const status = levelToStatus(item['level']);
	const message = item['msg'] || status;
	const host = item['hostname'];
	const service = item['service'];
	const pid = item['pid'];
	const stack = item['stack'];
	const type = item['type'];
	const timestamp = item['time'] || item['timestamp'] || new Date().getTime();

	const {
		time: _time,
		level: _level,
		msg: _msg,
		hostname: _hostname,
		service: _service,
		pid: _pid,
		stack: _stack,
		type: _type,
		...cleanedPayload
	} = item;

	const context = removeFalsy({ host, service, pid, stack, type });
	return {
		cleanedPayload,
		context,
		timestamp,
		message: message,
		level: status,
	} as PayloadMeta;
};

const defaultPreparePayload = (_payload: Payload, meta: PayloadMeta) => {
	return {
		metadata: {
			...meta.cleanedPayload,
			context: meta.context,
			level: meta.level,
		},
		message: meta.message,
		timestamp: meta.timestamp,
	};
};

// type Options = LogflareUserOptionsI & {
// 	size?: number;
// 	onPreparePayload?: PreparePayloadCallback;
// };

// const handlePreparePayload = (item: Record<string, any>, options: Options) => {
// 	const meta = extractPayloadMeta(item);
// 	const callback = options && options.onPreparePayload ? options.onPreparePayload : defaultPreparePayload;
// 	const result = callback(item, meta);
// 	return result;
// };

export {
	type Level,
	type LogEvent,
	formatPinoBrowserLogEvent,
	addLogflareTransformDirectives,
	defaultPreparePayload,
	extractPayloadMeta,
};
