import { PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER, PUBLIC_LOGFLARE_SOURCE_ID_SERVER } from '$env/static/public';
import { createLogflareHttpClient, type LogflareClient } from '../common/logflare';
import { setupLogger } from './logger';

let logflareClient: null | LogflareClient = null;
let disabled = false;

export const getServerLogflare = (): null | LogflareClient => {
	if (logflareClient) return logflareClient;
	if (disabled) return null;

	try {
		logflareClient = createLogflareHttpClient({
			accessToken: PUBLIC_LOGFLARE_ACCESS_TOKEN_SERVER,
			sourceId: PUBLIC_LOGFLARE_SOURCE_ID_SERVER,
		});
		setupLogger.info('Logflare for server created.');
		return logflareClient;
	} catch {
		disabled = true;
		setupLogger.warn('Logflare for server init failure.');
	}
	return null;
};
