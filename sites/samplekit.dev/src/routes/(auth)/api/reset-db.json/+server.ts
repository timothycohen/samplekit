import { RESET_DB_IP_WHITELIST, RESET_DB_KEY } from '$env/static/private';
import { db } from '$lib/db/server';
import { objectStorage } from '$lib/object-storage/server';
import { createLimiter } from '$lib/rate-limit/server';
import { guardApiKey } from '../guard';
import type { RequestHandler } from '@sveltejs/kit';

const resetDbLimiter = createLimiter({ id: 'resetDb', limiters: [{ kind: 'ipUa', rate: [2, '6h'] }] });

// curl -X POST http://localhost:5173/api/reset-db.json -H 'Content-Type: application/json' -d '{"cron_api_key":"...", "expected_db_name":"..."}'
const resetDbAndBucket: RequestHandler = async (event) =>
	guardApiKey({
		id: 'resetDb',
		event,
		limiter: resetDbLimiter,
		expectedKey: RESET_DB_KEY,
		ipWhitelist: RESET_DB_IP_WHITELIST.split(','),
		protectedFn: async () => {
			await db.meta.resetDb();
			await objectStorage.deleteAll();
		},
	});

export const POST = resetDbAndBucket;
