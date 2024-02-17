import { browser } from '$app/environment';
import { logger as clientLogger } from '../client/pino';
import { logger as serverLogger } from '../server/pino';
import type { Level, LogFn } from 'pino';

const delegate = (level: Level) => {
	const client = clientLogger[level].bind(clientLogger);
	const server = serverLogger[level].bind(serverLogger);

	return ((obj: unknown, msg?: string | undefined, ...args: unknown[]) => {
		if (browser) client(obj, msg, args);
		if (!browser) server(obj, msg, args);
	}) satisfies LogFn;
};

export const logger = {
	trace: delegate('trace'),
	debug: delegate('debug'),
	info: delegate('info'),
	warn: delegate('warn'),
	error: delegate('error'),
	fatal: delegate('fatal'),
};
