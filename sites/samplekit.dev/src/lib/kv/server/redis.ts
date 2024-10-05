import Redis from 'ioredis';
import { REDIS_PASSWORD, REDIS_PORT, REDIS_HOST } from '$env/static/private';
import { setupLogger, logger } from '$lib/logging/server';

type KV = Redis & { connectOrExit: () => Promise<void> };

export const kv = (() => {
	const kv = new Redis({ password: REDIS_PASSWORD, port: +REDIS_PORT, host: REDIS_HOST, lazyConnect: true }) as KV;

	const setupListener = (err: Error) => setupLogger.error(`Redis error: ${err}`);
	const errListener = (err: Error) => logger.error(`Redis error: ${err}`);

	const connectOrExit = async () => {
		// Prevent HMR from reconnecting
		if (kv.status === 'wait') {
			if (!REDIS_PASSWORD) setupLogger.fatal('Redis error: REDIS_PASSWORD is not set.');
			if (!REDIS_PORT) setupLogger.fatal('Redis error: REDIS_PORT is not set.');
			if (!REDIS_HOST) setupLogger.fatal('Redis error: REDIS_HOST is not set.');
			if (!REDIS_PASSWORD || !REDIS_PORT || !REDIS_HOST) process.exit(1);

			kv.addListener('error', setupListener);

			await kv
				.connect()
				.catch((e) => {
					setupLogger.fatal(
						`KV init failure: ${e.message}. If you are using docker, is it running? Hint: use \`pnpm dev:up\`.`,
					);
					process.exit(1);
				})
				.then(() => {
					setupLogger.info('KV connected.');
				});

			kv.removeListener('error', setupListener);
			kv.addListener('error', errListener);
		}
	};

	kv.connectOrExit = connectOrExit;
	return kv;
})();
