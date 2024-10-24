import { PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER, PUBLIC_LOGFLARE_SOURCE_ID_BROWSER } from '$env/static/public';
import { createLogflareHttpClient, type LogflareClient } from '../common/logflare';

let logflareClient: null | LogflareClient = null;
let disabled = false;

export const getBrowserLogflare = (): LogflareClient | null => {
	if (logflareClient) return logflareClient;
	if (disabled) return null;

	try {
		logflareClient = createLogflareHttpClient({
			accessToken: PUBLIC_LOGFLARE_ACCESS_TOKEN_BROWSER,
			sourceId: PUBLIC_LOGFLARE_SOURCE_ID_BROWSER,
		});
		return logflareClient;
	} catch {
		disabled = true;
	}
	return null;
};
