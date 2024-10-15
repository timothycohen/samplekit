import { browser } from '$app/environment';
import { PUBLIC_LOGLEVEL_CONSOLE_BROWSER, PUBLIC_LOGLEVEL_LOGFLARE_BROWSER } from '$env/static/public';
import { formatLogflare } from '../common/logflare';
import { Logger } from '../common/logger';
import { getBrowserLogflare } from './logflare';
import { captureExceptionWithSentry } from './sentry';

const consoleLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_CONSOLE_BROWSER);
const logflareLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_LOGFLARE_BROWSER);
const sentryLevel = 50;

export const logger = new Logger({
	write: ({ log, lvl }) => {
		if (!browser) return;

		if (lvl >= consoleLevel) Logger.writeToConsole({ lvl, log });

		if (lvl >= Math.min(logflareLevel, sentryLevel)) {
			const { formatted, raw } = formatLogflare({ lvl, mut_log: log });
			if (lvl >= logflareLevel) getBrowserLogflare()?.addLog(formatted);
			if (lvl >= sentryLevel) captureExceptionWithSentry(raw.error ?? formatted);
		}
	},
});
