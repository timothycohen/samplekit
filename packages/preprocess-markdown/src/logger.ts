/* eslint-disable no-console */

export type Logger = {
	error?: (e: Error, filename: string) => void;
	info?: (a: { count: number }, filename: string) => void;
};

export const createMdLogger = (formatFilename: (filename: string) => void = (filename: string) => filename): Logger => {
	return {
		error: (e, filename) => console.error(`[PREPROCESS] | Mark | Error | ${formatFilename(filename)} | ${e.message}`),
		info: (detail, filename) =>
			console.info(`[PREPROCESS] | Mark | Info | ${formatFilename(filename)} | count: ${detail.count}`),
	};
};
