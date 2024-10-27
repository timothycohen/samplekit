import { browser, building, version } from '$app/environment';
import { PUBLIC_LOGLEVEL_CONSOLE_SERVER, PUBLIC_LOGLEVEL_LOGFLARE_SERVER } from '$env/static/public';
import { formatLogflare } from '../common/logflare';
import { Logger } from '../common/logger';
import { getServerLogflare } from './logflare';
import { pretty } from './pretty';
import { captureExceptionWithSentry } from './sentry';

const consoleLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_CONSOLE_SERVER);
const logflareLevel = Logger.lvlStrToNum(PUBLIC_LOGLEVEL_LOGFLARE_SERVER);
const sentryLevel = 50;

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
			if (lvl >= sentryLevel) captureExceptionWithSentry(raw.error ?? formatted);
		}
	},
});

export const setupLogger = logger.child({ base: '[SETUP] ' });
export const wsLogger = logger.child({ base: '[WS] ' });
