import * as sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_ENABLED, PUBLIC_SENTRY_DSN } from '$env/static/public';
import { setupLogger } from './logger';

let mut_initialized = false;

/**
 * Very annoyingly, `@sentry/sveltekit` exports * from client, vite, and server, as well as adds some additional packages, but doesn't export the modules separately.
 *
 * Therefore, do not trust that a specific function is available on the client or server.
 *
 * Specifically, do not destructure the import in universal code (.svelte, +page.ts, etc.) as it may not exist in one env.
 */
export const initSentry = () => {
	if (mut_initialized) return;
	mut_initialized = true;

	if (PUBLIC_SENTRY_ENABLED !== 'true') {
		setupLogger.info(`Sentry for server: disabled.`);
		return;
	}

	if (!PUBLIC_SENTRY_DSN) {
		setupLogger.error(`Sentry for server error. Missing PUBLIC_SENTRY_DSN.`);
		return;
	}

	let initError = false;
	catchStdErr({
		trappedFn: () => {
			sentry.init({ dsn: PUBLIC_SENTRY_DSN, tracesSampleRate: 1 });
		},
		tmpWrite: (str: string) => {
			if (str.startsWith('Invalid')) initError = true;
			return true;
		},
	});

	if (initError) {
		setupLogger.error('Sentry for server error. `sentry.init` failure.');
	} else {
		setupLogger.info('Sentry for server: connected.');
	}
};

export const handleErrorWithSentry = sentry.handleErrorWithSentry;
export const sentryHandle = sentry.sentryHandle;
export const captureExceptionWithSentry = sentry.captureException;

const catchStdErr = ({ tmpWrite, trappedFn }: { trappedFn: () => void; tmpWrite: (str: string) => boolean }) => {
	const write = process.stdout.write;
	process.stderr.write = tmpWrite;
	trappedFn();
	process.stderr.write = write;
};
