import { DELETE_EXPIRED_TOKENS_KEY, DELETE_EXPIRED_TOKENS_IP_WHITELIST } from '$env/static/private';
import { auth } from '$lib/auth/server';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { guardApiKey } from '../guard';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const deleteExpiredTokensLimiter = createLimiter({
	id: 'deleteExpiredTokens',
	limiters: [{ kind: 'ipUa', rate: [2, '6h'] }],
});

// curl -X POST http://localhost:5173/api/expire-tokens.json -H 'Content-Type: application/json' -d '{"cron_api_key":"...", "expected_db_name":"..."}'
const deleteExpiredTokens = async (event: RequestEvent) =>
	guardApiKey({
		id: 'deleteExpiredTokens',
		event,
		limiter: deleteExpiredTokensLimiter,
		expectedKey: DELETE_EXPIRED_TOKENS_KEY,
		ipWhitelist: DELETE_EXPIRED_TOKENS_IP_WHITELIST.split(','),
		protectedFn: async () => {
			const deletedExpireTokens = (await auth.token.deleteAllExpired()).filter(([, deletedCount]) => deletedCount > 0);
			return { deleted_tokens: deletedExpireTokens };
		},
	});

export const POST: RequestHandler = deleteExpiredTokens;
