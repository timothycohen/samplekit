import { createRequire } from 'module';
import pino, { type Level } from 'pino';
import { LOG_TO, PG_CONNECTION_STRING } from '$env/static/private';
import { PINO_LOGFILE_ROOT } from '$env/static/private';
import { PUBLIC_PINO_LOG_LEVEL } from '$env/static/public';
import type { PinoPgOpts } from '@samplekit/pino-pg';
import type { PrettyOptions } from 'pino-pretty';

type OnePartial<T, K extends keyof T> = Required<Omit<T, K>> & Partial<Pick<T, K>>;

export type PrettyOpts = Partial<Omit<pino.TransportTargetOptions<PrettyOptions>, 'target'>>;
export type FileOpts = { destination: string; mkdir?: boolean };
export type PgOpts = OnePartial<PinoPgOpts, 'connectionString'>;
export type LogKey = 'debug' | 'error' | 'guardApi';
export type LogOptions = Record<LogKey, FileOpts | PgOpts>;

export const fileLogs: Record<LogKey, FileOpts> = {
	debug: { destination: `${PINO_LOGFILE_ROOT}/debug.log`, mkdir: true },
	error: { destination: `${PINO_LOGFILE_ROOT}/error.log`, mkdir: true },
	guardApi: { destination: `${PINO_LOGFILE_ROOT}/guard_api.log`, mkdir: true },
};

export const dbLogs: Record<LogKey, PgOpts> = {
	debug: { table: 'logs_debug', column: 'log' },
	error: { table: 'logs_error', column: 'log' },
	guardApi: { table: 'logs_guard_api', column: 'log' },
};

export const createPrettyTransport = (a: { level: Level; options?: PrettyOptions }): pino.TransportTargetOptions => ({
	target: 'pino-pretty',
	level: a.level,
	options: { destination: 1, ignore: 'hostname,pid', translateTime: 'SYS:HH:mm:ss', hideObject: false, ...a.options },
});

const createPinoPgTransport = (a: { level: Level; options: PgOpts }): pino.TransportTargetOptions => ({
	target: createRequire(import.meta.url).resolve('@samplekit/pino-pg'),
	level: a.level,
	options: { connectionString: PG_CONNECTION_STRING, ...a.options } as PgOpts,
});

const createFileTransport = (a: { level: Level; options: FileOpts }): pino.TransportTargetOptions => ({
	target: 'pino/file',
	level: a.level,
	options: a.options,
});

export const createPersistentTransport = (a: { level: Level; logKey: LogKey }): pino.TransportTargetOptions => {
	if (LOG_TO === 'DB') {
		return createPinoPgTransport({ level: a.level, options: dbLogs[a.logKey] });
	} else {
		return createFileTransport({ level: a.level, options: fileLogs[a.logKey] });
	}
};

export const logger = pino(
	{ level: PUBLIC_PINO_LOG_LEVEL || 'info', timestamp: pino.stdTimeFunctions.isoTime },
	pino.transport({
		targets: [
			createPersistentTransport({ level: 'debug', logKey: 'debug' }),
			createPersistentTransport({ level: 'error', logKey: 'error' }),
			createPrettyTransport({ level: 'trace', options: { hideObject: true } }),
		],
	}),
);
