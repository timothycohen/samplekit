import pino from 'pino';
import { DELETE_EXPIRED_TOKENS_IP_WHITELIST, DELETE_EXPIRED_TOKENS_KEY } from '$env/static/private';
import { auth } from '$lib/auth/server';
import { createDeviceLimiter } from '$lib/botProtection/rateLimit/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { createPersistentTransport, createPrettyTransport } from '$lib/logging/server';
import { postReq } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const deleteExpiredTokensLimiter = createDeviceLimiter({ id: 'deleteExpiredTokens', rate: [2, '6h'] });

const fileLogger = pino(
	{ timestamp: pino.stdTimeFunctions.isoTime },
	pino.transport({
		targets: [
			createPersistentTransport({ level: 'trace', logKey: 'expireTokens' }),
			createPersistentTransport({ level: 'error', logKey: 'error' }),
		],
	}),
);

const consoleLogger = pino({ transport: createPrettyTransport({ level: 'trace' }) });

const log = (
	method: 'info' | 'error',
	log: { address: string; err_code?: string; deleted_tokens?: Awaited<ReturnType<typeof auth.token.deleteAllExpired>> },
) => {
	fileLogger[method](log);
	consoleLogger[method](log, 'expireTokens');
};

// curl -X POST http://localhost:5173/api/expire-tokens.json -H 'Content-Type: application/json' -d '{"cron_api_key":"..."}'
const deleteExpiredTokens = async (event: RequestEvent) => {
	const { request, getClientAddress } = event;
	const req = postReq.safeParse(await request.json().catch(() => ({})));
	const whitelist = DELETE_EXPIRED_TOKENS_IP_WHITELIST.split(',');
	const openWhitelist = whitelist.length === 1 && whitelist[0]! === '*';

	let err: { err_code: string; status: 400 | 403 | 429 } | null = null;

	if (!req.success) {
		err = { err_code: req.error.issues[0]?.code ?? 'bad_request', status: 400 };
	} else if ((await deleteExpiredTokensLimiter.check(event)).limited) {
		err = { err_code: 'rate_limited', status: 429 };
	} else if (DELETE_EXPIRED_TOKENS_KEY === '' || DELETE_EXPIRED_TOKENS_KEY !== req.data.cron_api_key) {
		err = { err_code: 'incorrect_key', status: 403 };
	} else if (!openWhitelist && !whitelist.includes(getClientAddress())) {
		err = { err_code: 'incorrect_ip', status: 403 };
	}

	if (err) {
		log('error', { err_code: err.err_code, address: getClientAddress() });
		return jsonFail(err.status);
	} else {
		const deletedExpireTokens = (await auth.token.deleteAllExpired()).filter(([, deletedCount]) => deletedCount > 0);
		log('info', { deleted_tokens: deletedExpireTokens, address: getClientAddress() });
		return jsonOk();
	}
};

export const POST: RequestHandler = deleteExpiredTokens;
