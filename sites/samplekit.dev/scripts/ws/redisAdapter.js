import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

/**
 *
 * @param {string} name
 * @returns {string}
 */
const getEnv = (name) => {
	const env = process.env[name];
	if (!env) {
		console.error(`FATAL: ${name} environment variable is not set (are you running with env-cmd?)`);
		process.exit(1);
	}
	return env;
};

const REDIS_HOST = getEnv('REDIS_HOST');
const REDIS_PASSWORD = getEnv('REDIS_PASSWORD');
const REDIS_PORT = getEnv('REDIS_PORT');

const pubClient = new Redis({ password: REDIS_PASSWORD, port: +REDIS_PORT, host: REDIS_HOST });
const subClient = pubClient.duplicate();
export const adapter = createAdapter(pubClient, subClient);
