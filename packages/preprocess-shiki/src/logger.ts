/* eslint-disable no-console */

import type { Logger } from './types.js';

export const createShikiLogger = (
	formatFilename: (filename: string) => void = (filename: string) => filename,
): Logger => {
	return {
		error: (e, filename) => console.error(`[PREPROCESS] | Code | Error | ${formatFilename(filename)} | ${e.message}`),
		warn: (e, filename) => console.warn(`[PREPROCESS] | Code | Warn | ${formatFilename(filename)} | ${e.message}`),
		info: (detail, filename) =>
			console.info(`[PREPROCESS] | Code | Info | ${formatFilename(filename)} | count: ${detail.count}`),
	};
};
