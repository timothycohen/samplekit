import { init as sentryInit } from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

export const initSentry = () =>
	sentryInit({
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: dev ? 1 : 0.1,
		replaysOnErrorSampleRate: 1.0,
	});
