import * as sentry from '@sentry/sveltekit';
import { browser } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
	PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
	PUBLIC_LOGLEVEL_CONSOLE_BROWSER,
	PUBLIC_LOGLEVEL_LOGFLARE_BROWSER,
} from '$env/static/public';
import { createLogflareHttpClient, formatLogflare, type LogflareClient } from '../common/logflare';
import { Logger } from '../common/logger';

const consoleLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_CONSOLE_BROWSER);
const logflareLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_LOGFLARE_BROWSER);
const sentryLevel = 50;

export const getBrowserLogflare = (() => {
	let logflareClient: null | LogflareClient = null;
	let disabled = false;

	const get = () => {
		if (logflareClient) return logflareClient;
		if (disabled) return;

		try {
			logflareClient = createLogflareHttpClient({
				accessToken: PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
				sourceId: PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
			});
			return logflareClient;
		} catch {
			disabled = true;
		}
	};

	return get;
})();

export const logger = new Logger({
	write: ({ log, lvl }) => {
		if (!browser) return;

		if (lvl >= consoleLevel) Logger.writeToConsole({ lvl, log });

		if (lvl >= Math.min(logflareLevel, sentryLevel)) {
			const { formatted, raw } = formatLogflare({ lvl, mut_log: log });
			if (lvl >= logflareLevel) getBrowserLogflare()?.addLog(formatted);
			if (lvl >= sentryLevel) sentry.captureException(raw.error ?? formatted);
		}
	},
});
