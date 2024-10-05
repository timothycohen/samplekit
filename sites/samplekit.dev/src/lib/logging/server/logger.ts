import { browser, building, version } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
	PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
	PUBLIC_LOGLEVEL_CONSOLE_SERVER,
	PUBLIC_LOGLEVEL_LOGFLARE_SERVER,
} from '$env/static/public';
import { createLogflareHttpClient, formatLogflare, type LogflareClient } from '../common/logflare';
import { Logger } from '../common/logger';
import { createPinoPretty } from '../common/pretty';
import { getSentry } from './sentry';

const consoleLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_CONSOLE_SERVER);
const logflareLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_LOGFLARE_SERVER);
const sentryLevel = 50;

export const getServerLogflare = (() => {
	let logflareClient: null | LogflareClient = null;
	let disabled = false;

	const get = () => {
		if (logflareClient) return logflareClient;
		if (disabled) return;

		try {
			logflareClient = createLogflareHttpClient({
				accessToken: PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
				sourceId: PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
			});
			setupLogger.info('Logflare for server created.');
			return logflareClient;
		} catch {
			disabled = true;
			setupLogger.warn('Logflare for server init failure.');
		}
	};

	return get;
})();

const pretty = createPinoPretty({ ignore: 'context,status' });

export const logger = new Logger({
	base: {
		context: {
			mode: import.meta.env.MODE,
			building,
			version,
		},
	},
	write: ({ log, lvl }) => {
		if (browser) return;

		if (lvl >= Math.min(consoleLevel, logflareLevel, sentryLevel)) {
			const { formatted, raw } = formatLogflare({ lvl, mut_log: log });

			if (lvl >= consoleLevel) {
				const json = pretty.stringify({
					metadata: formatted.metadata,
					time: formatted.timestamp,
					msg: raw.msgs?.join(''),
				});
				pretty.write(json);
			}
			if (lvl >= logflareLevel) getServerLogflare()?.addLog(formatted);
			if (lvl >= sentryLevel) getSentry()?.captureException(raw.error ?? formatted);
		}
	},
});

export const setupLogger = logger.child({ base: '[SETUP] ' });
