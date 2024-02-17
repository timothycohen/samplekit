/* eslint-disable no-console */

import { captureException } from '@sentry/sveltekit';
import pino, { levels } from 'pino';
import { browser } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
	PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
	PUBLIC_LOGLEVEL_CONSOLE_BROWSER,
	PUBLIC_LOGLEVEL_LOGFLARE_BROWSER,
} from '$env/static/public';
import { createPinoBrowserSend } from '../common/pino-logflare';

const sendLogflare = createPinoBrowserSend({
	apiKey: PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
	sourceToken: PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
});

const consoleLevel = levels.values[PUBLIC_LOGLEVEL_CONSOLE_BROWSER] || 30;
const logflareLevel = levels.values[PUBLIC_LOGLEVEL_LOGFLARE_BROWSER] || 30;

export const logger = pino({
	browser: {
		write: (o) => {
			if (!browser) return;

			if ('level' in o && typeof o.level === 'number' && o.level < consoleLevel) return;
			console.log(o);
		},
		transmit: {
			send: (level, logEvent) => {
				if (!browser) return;

				const numLevel = levels.values[level] || 30;
				if (numLevel < logflareLevel) return;
				sendLogflare(level, logEvent);
				if (numLevel >= 50) captureException(logEvent);
			},
		},
	},
});
