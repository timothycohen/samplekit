import { init as sentryInit } from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

/**
 * Very annoyingly, `@sentry/sveltekit` exports * from client, vite, and server, as well as adds some additional packages, but doesn't export the modules separately.
 *
 * Therefore, do not trust that a specific function is available on the client or server.
 *
 * Specifically, do not destructure the import in universal code (.svelte, +page.ts, etc.) as it may not exist in one env.
 */
export const initSentry = () =>
	sentryInit({
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: 1,
	});
