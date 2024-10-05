import { init as sentryInit } from '@sentry/sveltekit';
import { PUBLIC_SENTRY_ENABLED, PUBLIC_SENTRY_DSN } from '$env/static/public';

export const initSentry = () =>
	sentryInit({
		enabled: PUBLIC_SENTRY_ENABLED === 'true',
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		environment: import.meta.env.MODE,
	});
