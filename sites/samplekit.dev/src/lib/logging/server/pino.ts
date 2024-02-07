import pino, { type Level } from 'pino';
import { PINO_LOGFILE_ROOT } from '$env/static/private';
import { PUBLIC_PINO_LOG_LEVEL } from '$env/static/public';
import type { PrettyOptions } from 'pino-pretty';

export type PrettyOpts = Partial<Omit<pino.TransportTargetOptions<PrettyOptions>, 'target'>>;
export type FileOpts = { destination: string; mkdir?: boolean };
export type LogKey = 'debug' | 'error';
export type LogOptions = Record<LogKey, FileOpts>;

export const fileLogs: Record<LogKey, FileOpts> = {
	debug: { destination: `${PINO_LOGFILE_ROOT}/debug.log`, mkdir: true },
	error: { destination: `${PINO_LOGFILE_ROOT}/error.log`, mkdir: true },
};

export const createPrettyTransport = (a: { level: Level; options?: PrettyOptions }): pino.TransportTargetOptions => ({
	target: 'pino-pretty',
	level: a.level,
	options: { destination: 1, ignore: 'hostname,pid', translateTime: 'SYS:HH:mm:ss', hideObject: false, ...a.options },
});

const createFileTransport = (a: { level: Level; options: FileOpts }): pino.TransportTargetOptions => ({
	target: 'pino/file',
	level: a.level,
	options: a.options,
});

export const createPersistentTransport = (a: { level: Level; logKey: LogKey }): pino.TransportTargetOptions => {
	return createFileTransport({ level: a.level, options: fileLogs[a.logKey] });
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
