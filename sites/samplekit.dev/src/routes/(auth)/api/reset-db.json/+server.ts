import { RESET_DB_IP_WHITELIST, RESET_DB_KEY } from '$env/static/private';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { clearBucket } from '$lib/cloudStorage/server';
import { resetDb } from '$lib/db/server';
import { guardApiKey } from '../guard';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const resetDbLimiter = createLimiter({ id: 'resetDb', limiters: [{ kind: 'ipUa', rate: [2, '6h'] }] });

// curl -X POST http://localhost:5173/api/reset-db.json -H 'Content-Type: application/json' -d '{"cron_api_key":"...", "expected_db_name":"..."}'
const resetDbAndBucket = async (event: RequestEvent) =>
	guardApiKey({
		id: 'resetDb',
		event,
		limiter: resetDbLimiter,
		expectedKey: RESET_DB_KEY,
		ipWhitelist: RESET_DB_IP_WHITELIST.split(','),
		protectedFn: async () => {
			await resetDb();
			await clearBucket();
		},
	});

export const POST: RequestHandler = resetDbAndBucket;
