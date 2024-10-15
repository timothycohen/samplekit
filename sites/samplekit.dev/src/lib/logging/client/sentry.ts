import * as sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_ENABLED, PUBLIC_SENTRY_DSN } from '$env/static/public';

export const initSentry = () =>
	sentry.init({
		enabled: PUBLIC_SENTRY_ENABLED === 'true',
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		environment: import.meta.env.MODE,
		integrations: [sentry.replayIntegration()],
	});

export const handleErrorWithSentry = sentry.handleErrorWithSentry;
export const captureExceptionWithSentry = sentry.captureException;
