import * as _sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

/**
 * Very annoyingly, `@sentry/sveltekit` exports * from client, vite, and server, as well as adds some additional packages, but doesn't export the modules separately.
 *
 * Therefore, do not trust that a specific function is available on the client or server.
 *
 * Specifically, do not destructure the import in universal code (.svelte, +page.ts, etc.) as it may not exist in one env.
 */
export const getSentry = (() => {
	let sentry: null | typeof _sentry = null;
	let disabled = false;

	const get = () => {
		if (sentry) return sentry;
		if (disabled) return;

		if (!PUBLIC_SENTRY_DSN) {
			disabled = true;
			return;
		}

		catchStdErr({
			trappedFn: () => {
				_sentry.init({ dsn: PUBLIC_SENTRY_DSN, tracesSampleRate: 1 });
				if (disabled) return;
				sentry = _sentry;
			},
			tmpWrite: (str: string) => {
				if (str.startsWith('Invalid')) {
					disabled = true;
				}
				return true;
			},
		});

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
