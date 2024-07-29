/* eslint-disable no-console */

export type Logger = {
	error?: (e: Error, filename: string) => void;
	warn?: (e: Error, filename: string) => void;
	info?: (detail: { count: number }, filename: string) => void;
};

export const createKatexLogger = (
	formatFilename: (filename: string) => void = (filename: string) => filename,
): Logger => {
	return {
		error: (e, filename) => console.error(`[PREPROCESS] | Math | Error | ${formatFilename(filename)} | ${e.message}`),
		warn: (e: Error, filename) =>
			console.warn(`[PREPROCESS] | Math | Warn | ${formatFilename(filename)} | ${e.message}`),
		info: (detail, filename) =>
			console.info(`[PREPROCESS] | Math | Info | ${formatFilename(filename)} | count: ${detail.count}`),
	};
};
