import { RESET_DB_IP_WHITELIST, RESET_DB_KEY } from '$env/static/private';
import { createDeviceLimiter } from '$lib/botProtection/rateLimit/server';
import {
	db,
	users,
	authProviders,
	presignedUrls,
	sessions,
	passkeyChallenge,
	setupAuthenticator,
	emailVeri,
	pwReset,
	smsVeri,
	setupSMSVeri,
} from '$lib/db/server';
import { guardApiKey } from '../guard';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const resetDbLimiter = createDeviceLimiter({ id: 'resetDb', rate: [2, '6h'] });

// curl -X POST http://localhost:5173/api/reset-db.json -H 'Content-Type: application/json' -d '{"cron_api_key":"..."}'
const resetDb = async (event: RequestEvent) =>
	guardApiKey({
		id: 'resetDb',
		event,
		limiter: resetDbLimiter,
		expectedKey: RESET_DB_KEY,
		ipWhitelist: RESET_DB_IP_WHITELIST.split(','),
		protectedFn: async () => {
			await Promise.all(
				[presignedUrls, emailVeri, passkeyChallenge, pwReset, setupAuthenticator, setupSMSVeri, smsVeri].map((table) =>
					db.delete(table),
				),
			);
			await db.delete(sessions);
			await db.delete(authProviders);
			await db.delete(users);
		},
	});

export const POST: RequestHandler = resetDb;
