import type { FormattedLogflare } from './formatters';

type LogflareClientOpts<Unformatted, Formatted> = {
	apiKey: string;
	sourceToken: string;
	logCountBeforeFlush: number;
	delayBeforeFlush: number;
	format: (a: Unformatted) => Formatted;
	onError: (a: { batch: Formatted[]; error: { msg: string; status: number; jsonResponse: unknown } | Error }) => void;
};

type LogflareClient<Unformatted, Formatted> = {
	format: (a: Unformatted) => Formatted;
	addLog: (a: Formatted) => void;
	flush: () => Promise<void>;
	getStoredLogsSize: () => number;
};

/**
 * The minimum of logCountBeforeFlush and delayBeforeFlush will be used.
 *
 * If logCountBeforeFlush is 3, and a third log is pushed, it will immediately be flushed.
 *
 * If there are only two logs, it will wait delayBeforeFlush ms before flushing.
 */
export const createLogflareHttpClient = <Unformatted, Formatted = FormattedLogflare>({
	apiKey,
	sourceToken,
	logCountBeforeFlush,
	delayBeforeFlush,
	format,
	onError,
}: LogflareClientOpts<Unformatted, Formatted>): LogflareClient<Unformatted, Formatted> => {
	if (!sourceToken || sourceToken == '') throw 'Missing Logflare sourceToken.';
	if (!apiKey || apiKey == '') throw 'Missing Logflare apiKey.';

	const logs: Formatted[] = [];
	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const addLog = (cleanLog: Formatted): void => {
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
			const response = await fetch(`https://api.logflare.app/logs?api_key=${apiKey}&source=${sourceToken}`, {
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
		format,
		addLog,
		flush,
		getStoredLogsSize() {
			return logs.length;
		},
	};
};
