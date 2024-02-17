import { Logger, type Log } from './logger';

export type FormattedLogflare = {
	message: string;
	metadata: Record<string, unknown> & {
		level: number;
		status: string;
		err?: { name: string; message: string; stack?: string | undefined };
	};
	timestamp: number;
};

export const formatLogflare = ({
	lvl,
	mut_log,
}: {
	lvl: number;
	mut_log: Log.Raw;
}): { formatted: FormattedLogflare; raw: { ts?: number; msgs?: string[]; error?: Error } } => {
	const status = Logger.lvlNumToStr(lvl);
	const obj = Logger.toObj(mut_log);
	const { timestamp, raw: ts } = Logger.extractTimestamp({ mut_log: obj });
	const { msg, raw: msgs } = Logger.extractMsg({ mut_log: obj });
	const { err, raw: error } = Logger.extractErr({ mut_log: obj });

	let message = `${status.toUpperCase()}: `;
	if (msg) message = message + msg;
	else if (err?.message) message = message + err.message;

	return {
		raw: { ts, msgs, error },
		formatted: { timestamp: timestamp || Date.now(), message, metadata: { ...obj, status, level: lvl, err } },
	};
};

export const defaultOpts: Required<Pick<LogflareClientOpts, 'delayBeforeFlush' | 'logCountBeforeFlush' | 'onError'>> = {
	delayBeforeFlush: 5000,
	logCountBeforeFlush: 15,
	onError: ({ batch, error }) => {
		// eslint-disable-next-line no-console
		console.error('Logflare error:', { error, batch });
	},
};

type LogflareClientOpts = {
	accessToken: string;
	sourceId: string;
	logCountBeforeFlush?: number;
	delayBeforeFlush?: number;
	onError?: (a: {
		batch: FormattedLogflare[];
		error: { msg: string; status: number; jsonResponse: unknown } | Error;
	}) => void;
};

export type LogflareClient = {
	addLog: (a: FormattedLogflare) => void;
	flush: () => Promise<void>;
	getStoredLogsSize: () => number;
};

/**
 * @throws Error if sourceId or accessToken are missing.
 *
 * The minimum of logCountBeforeFlush and delayBeforeFlush will be used.
 *
 * If logCountBeforeFlush is 3, and a third log is pushed, it will immediately be flushed.
 *
 * If there are only two logs, it will wait delayBeforeFlush ms before flushing.
 */
export const createLogflareHttpClient = (a: LogflareClientOpts): LogflareClient => {
	const { accessToken, sourceId, logCountBeforeFlush, delayBeforeFlush, onError } = { ...defaultOpts, ...a };
	if (!sourceId || sourceId == '') throw new Error('Missing Logflare sourceId.');
	if (!accessToken || accessToken == '') throw new Error('Missing Logflare accessToken.');

	const logs: FormattedLogflare[] = [];
	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const addLog = (cleanLog: FormattedLogflare): void => {
		logs.push(cleanLog);
		if (logs.length >= logCountBeforeFlush) flush();
		else timeout = setTimeout(flush, delayBeforeFlush);
	};

	const flush = async (): Promise<void> => {
		const batch = [...logs];
		if (batch.length === 0) return;
		logs.length = 0;
		clearTimeout(timeout);

		try {
			const response = await fetch(`https://api.logflare.app/logs?api_key=${accessToken}&source=${sourceId}`, {
				method: 'POST',
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ batch }),
			});

			const data = await response.json();

			if (data['error']) onError({ batch, error: new Error(data['error']) });

			if (!response.ok) {
				onError({
					batch,
					error: { msg: 'Network response was not okay', status: response.status, jsonResponse: data },
				});
				return;
			}
		} catch (error) {
			if (error instanceof Error) onError({ batch, error });
			else onError({ batch, error: new Error('Unknown logflare HTTP error') });
		}
	};

	return {
		addLog,
		flush,
		getStoredLogsSize() {
			return logs.length;
		},
	};
};
