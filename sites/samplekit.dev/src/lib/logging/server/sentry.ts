import * as _sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { logger, setupLogger } from '.';

/**
 * Very annoyingly, `@sentry/sveltekit` exports * from client, vite, and server, as well as adds some additional packages, but doesn't export the modules separately.
 *
 * Therefore, do not trust that a specific function is available on the client or server.
 *
 * Specifically, do not destructure the import in universal code (.svelte, +page.ts, etc.) as it may not exist in one env.
 */
export const getSentry = (() => {
	let sentry: null | typeof _sentry = null;

	const get = () => {
		if (sentry) return sentry;

		if (!PUBLIC_SENTRY_DSN) {
			setupLogger.fatal(`Sentry DSN not found. Please add PUBLIC_SENTRY_DSN to your .env file.`);
			process.exit(1);
		}

		catchStdErr({
			trappedFn: () => {
				_sentry.init({ dsn: PUBLIC_SENTRY_DSN, tracesSampleRate: 1 });
				sentry = _sentry;
			},
			tmpWrite: (_str: string) => {
				if (_str.startsWith('Invalid')) {
					logger.fatal(_str);
					process.exit(1);
				}
				return true;
			},
		});

		setupLogger.info('Sentry initialized on server.');
		return sentry!;
	};

	return get;
})();

const catchStdErr = ({ tmpWrite, trappedFn }: { trappedFn: () => void; tmpWrite: (str: string) => boolean }) => {
	const write = process.stdout.write;
	process.stderr.write = tmpWrite;
	trappedFn();
	process.stderr.write = write;
};
