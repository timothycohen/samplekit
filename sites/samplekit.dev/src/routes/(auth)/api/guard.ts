import { z } from 'zod';
import { DB_NAME } from '$env/static/private';
import { createDeviceLimiter } from '$lib/botProtection/rateLimit/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import { logger } from '$lib/logging/server';
import type { RequestEvent } from '@sveltejs/kit';

const postReq = z.object({ cron_api_key: z.string().length(63), expected_db_name: z.string() });

const log = (method: 'info' | 'error', log: { id: string; address: string; err_code?: string }) => {
	logger[method](log);
};

export const guardApiKey = async ({
	id,
	event,
	limiter,
	expectedKey,
	ipWhitelist,
	protectedFn,
}: {
	id: string;
	event: RequestEvent;
	limiter: ReturnType<typeof createDeviceLimiter>;
	expectedKey: string;
	ipWhitelist: string[];
	/** Return loggables */
	protectedFn: () => Promise<Record<string, unknown> | void | null | undefined>;
}) => {
	const { request, getClientAddress } = event;
	const req = postReq.safeParse(await request.json().catch(() => ({})));

	const openWhitelist = ipWhitelist.length === 1 && ipWhitelist[0]! === '*';

	let err: null | { err_code: string; status: 400 | 403 | 429 } = null;
	if (!req.success) {
		err = { err_code: req.error.issues[0]?.code ?? 'bad_request', status: 400 };
	} else if (req.data.expected_db_name !== DB_NAME) {
		err = { err_code: 'incorrect_env', status: 403 };
	} else if ((await limiter.check(event)).limited) {
		err = { err_code: 'rate_limited', status: 429 };
	} else if (expectedKey === '' || expectedKey !== req.data.cron_api_key) {
		err = { err_code: 'incorrect_key', status: 403 };
	} else if (!openWhitelist && !ipWhitelist.includes(getClientAddress())) {
		err = { err_code: 'incorrect_ip', status: 403 };
	}

	if (err) {
		log('error', { id, address: getClientAddress(), err_code: err.err_code });
		return jsonFail(err.status);
	} else {
		const loggables = (await protectedFn()) ?? {};
		log('info', { id, address: getClientAddress(), ...loggables });
		return jsonOk();
	}
};
