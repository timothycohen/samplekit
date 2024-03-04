import Redis from 'ioredis';
import { REDIS_PASSWORD, REDIS_PORT, REDIS_HOST } from '$env/static/private';
import { setupLogger } from '$lib/logging/server';

type KV = Redis & { connectOrExit: () => Promise<void> };

export const kv = (() => {
	const kv = new Redis({ password: REDIS_PASSWORD, port: +REDIS_PORT, host: REDIS_HOST, lazyConnect: true }) as KV;

	const connectOrExit = async () => {
		// Prevent HMR from reconnecting
		if (kv.status === 'wait')
			await kv
				.connect()
				.catch((e) => {
					setupLogger.fatal(`KV init failure: ${e.message}`);
					process.exit(1);
				})
				.then(() => {
					setupLogger.info('KV connected.');
				});
	};

	kv.connectOrExit = connectOrExit;
	return kv;
})();
