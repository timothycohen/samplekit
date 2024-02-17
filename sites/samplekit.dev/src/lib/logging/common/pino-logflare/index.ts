// Pulled this out of https://github.com/logflare/pino-logflare because they mixed node/browser environments, requiring polyfills for code that wasn't even being used.

import { LogflareHttpClient } from './httpClient.js';
import {
	formatPinoBrowserLogEvent,
	addLogflareTransformDirectives,
	type Level,
	type LogEvent,
	type LogflareUserOptionsI,
} from './utils.js';

export const createPinoBrowserSend = (options: LogflareUserOptionsI) => {
	const client = new LogflareHttpClient({ ...options, fromBrowser: true });

	return (_level: Level | number, logEvent: LogEvent) => {
		const logflareLogEvent = formatPinoBrowserLogEvent(logEvent);
		const maybeWithTransforms = addLogflareTransformDirectives(logflareLogEvent, options);
		client.postLogEvents([maybeWithTransforms]);
	};
};

export { defaultPreparePayload, extractPayloadMeta } from './utils.js';
