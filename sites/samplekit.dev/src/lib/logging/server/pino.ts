/* eslint-disable no-console */

import pino, { levels } from 'pino';
import pinoPretty, { type PrettyOptions } from 'pino-pretty';
import { dev, building, version, browser } from '$app/environment';
import {
	PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
	PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
	PUBLIC_LOGLEVEL_CONSOLE_SERVER,
	PUBLIC_LOGLEVEL_LOGFLARE_SERVER,
} from '$env/static/public';
import { defaultPreparePayload, extractPayloadMeta } from '../common/pino-logflare';

const createPinoPretty = (options?: PrettyOptions) =>
	pinoPretty({
		destination: 1,
		ignore: 'context',
		translateTime: 'SYS:HH:mm:ss',
		hideObject: false,
		...options,
	});

const createLogflareFetch =
	({ sourceToken, apiKey }: { sourceToken: string; apiKey: string }) =>
	async (cleanBody: string): Promise<{ data: unknown; error?: never } | { data?: never; error: Error }> => {
		try {
			const res = await fetch(`https://api.logflare.app/logs?source=${sourceToken}`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-API-KEY': apiKey,
				},
				body: cleanBody,
			});
			const data = await res.json();
			if (data['error']) return { error: new Error(data['error']) };
			return { data };
		} catch (err) {
			if (err instanceof Error) return { error: err };
			else return { error: new Error('logflare fetch error') };
		}
	};

const consoleLevel = levels.values[PUBLIC_LOGLEVEL_CONSOLE_SERVER] || 30;
const logflareLevel = levels.values[PUBLIC_LOGLEVEL_LOGFLARE_SERVER] || 30;

const fetcher = createLogflareFetch({
	apiKey: PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
	sourceToken: PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
});

const pretty = createPinoPretty();

export const logger = pino(
	{
		base: { context: { env: dev ? 'development' : 'production', building, version } },
	},
	{
		write: (msg: string) => {
			if (browser) return;

			let cleanMsg;
			let o;
			try {
				// This is grotesque for a reason
				// This isn't using pino v7+ transports because globalThis.__bundlerPathsOverrides hacks to rectify module resolution errors caused by adapter-vercel were too unsavory.
				// This isn't using pino.multiStream because pino-logflare.createWriteStream had undici errors (UND_ERR_CONNECT_TIMEOUT)
				// This is using a custom version of pino-logflare because that package exported client and server code together and therefore required polyfills for functions that weren't even being used.
				const parsed = JSON.parse(msg);
				o = defaultPreparePayload(parsed, extractPayloadMeta(parsed));
				cleanMsg = JSON.stringify(o);
			} catch {
				return console.error(new Error('Unable to stringify logger body'));
			}
			if (!cleanMsg || !o) return console.error(new Error('Unable to stringify logger body'));

			const wordLevel = o['metadata']['level']!;
			const level = levels.values[wordLevel];

			if (typeof level === 'number' && level >= consoleLevel) pretty.write(msg);
			if (typeof level === 'number' && level >= logflareLevel) {
				fetcher(cleanMsg).then(({ error }) => {
					if (error) console.error(error);
				});
			}
		},
	},
);
