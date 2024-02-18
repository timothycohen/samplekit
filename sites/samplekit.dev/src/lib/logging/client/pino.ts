/* eslint-disable no-console */

import * as sentry from '@sentry/sveltekit';
import pino, { levels } from 'pino';
import { browser } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
	PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
	PUBLIC_LOGLEVEL_CONSOLE_BROWSER,
	PUBLIC_LOGLEVEL_LOGFLARE_BROWSER,
} from '$env/static/public';
import { formatLogEvent, createLogflareHttpClient } from '../common/pino-logflare';

const logflareClient = createLogflareHttpClient({
	apiKey: PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
	sourceToken: PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
	delayBeforeFlush: 3000,
	logCountBeforeFlush: 5,
	onError: ({ batch, error }) => {
		console.error('Logflare error:', error);
		console.error('Logflare batch:', batch);
	},
	format: formatLogEvent,
});

const consoleLevel = levels.values[PUBLIC_LOGLEVEL_CONSOLE_BROWSER] || 30;
const logflareLevel = levels.values[PUBLIC_LOGLEVEL_LOGFLARE_BROWSER] || 30;

export const logger = pino({
	browser: {
		write: (o) => {
			if (!browser) return;

			// Note: this has a bug where log.info(null, 'message') will not log the message
			if ('level' in o && typeof o.level === 'number' && o.level < consoleLevel) return;
			console.log(o);
		},
		transmit: {
			send: (_strLevel, logEvent) => {
				if (!browser) return;

				const formatted = logflareClient.format(logEvent);
				if (formatted.metadata.level >= logflareLevel) logflareClient.addLog(formatted);
				if (formatted.metadata.level >= 50) sentry.captureException(formatted);
			},
		},
	},
});
