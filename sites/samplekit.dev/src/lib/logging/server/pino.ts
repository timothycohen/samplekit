/* eslint-disable no-console */

import * as sentry from '@sentry/sveltekit';
import pino, { levels } from 'pino';
import pinoPretty, { type PrettyOptions } from 'pino-pretty';
import { dev, building, version, browser } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
	PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
	PUBLIC_LOGLEVEL_CONSOLE_SERVER,
	PUBLIC_LOGLEVEL_LOGFLARE_SERVER,
} from '$env/static/public';
import { createLogflareHttpClient, formatWriteMsg, type ParsedMsg } from '../common/pino-logflare';

const createPinoPretty = (options?: PrettyOptions) =>
	pinoPretty({
		destination: 1,
		ignore: 'context',
		translateTime: 'SYS:HH:mm:ss',
		hideObject: false,
		...options,
	});

const logflareClient = createLogflareHttpClient({
	apiKey: PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
	sourceToken: PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
	delayBeforeFlush: 3000,
	logCountBeforeFlush: 5,
	onError: ({ batch, error }) => {
		console.error('Logflare error:', error);
		console.error('Logflare batch:', batch);
	},
	format: formatWriteMsg,
});

const consoleLevel = levels.values[PUBLIC_LOGLEVEL_CONSOLE_SERVER] || 30;
const logflareLevel = levels.values[PUBLIC_LOGLEVEL_LOGFLARE_SERVER] || 30;

const pretty = createPinoPretty();

export const logger = pino(
	{
		base: { context: { env: dev ? 'development' : 'production', building, version } },
	},
	{
		write: (json: string) => {
			if (browser) return;

			// This grotesque JSON.parse is for a reason
			// This isn't using pino v7+ transports because globalThis.__bundlerPathsOverrides hacks to rectify module resolution errors caused by adapter-vercel were too unsavory.
			// This isn't using pino.multiStream because pino-logflare.createWriteStream had undici errors (UND_ERR_CONNECT_TIMEOUT)
			// This is using a custom version of pino-logflare because that package exported client and server code together and therefore required polyfills for functions that weren't even being used.
			let parsed: ParsedMsg;
			try {
				parsed = JSON.parse(json);
			} catch {
				return console.error(new Error('Unable to parse logger write msg'));
			}

			const formatted = logflareClient.format(parsed);
			if (formatted.metadata.level >= consoleLevel) pretty.write(json);
			if (formatted.metadata.level >= logflareLevel) logflareClient.addLog(formatted);
			if (formatted.metadata.level >= 50) sentry.captureException(formatted);
		},
	},
);
