import { z } from 'zod';
import { DB_NAME } from '$env/static/private';
import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { logger } from '$lib/logging/server';
import type { createLimiter } from '$lib/rate-limit/server';
import type { RequestEvent } from '@sveltejs/kit';

const postReq = z.object({ cron_api_key: z.string(), expected_db_name: z.string() });

const log = (method: 'info' | 'error', log: { id: string; address: string; err_code?: string }) => {
	logger[method](log);
};

const isInternalIpAddr = (ip: string) => {
	const ipParts = ip.split('.');
	if (ipParts.length !== 4) return false;
	const str2 = ipParts[1];
	if (typeof str2 === 'undefined') return false;
	const num2 = +str2;
	if (Number.isNaN(num2)) return false;
	return (
		ipParts[0] === '10' ||
		(ipParts[0] === '192' && str2 === '168') ||
		(ipParts[0] === '172' && num2 >= 16 && num2 <= 31)
	);
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
	limiter: ReturnType<typeof createLimiter>;
	expectedKey: string;
	ipWhitelist: string[];
	/** Return loggables */
	protectedFn: () => Promise<Record<string, unknown> | void | null | undefined>;
}) => {
	const { request, getClientAddress } = event;
	const body = await parseReqJson(request, postReq);

	const err: null | { err_code: string; status: 400 | 403 | 429 } = await (async () => {
		if (!body.success) {
			return { err_code: body.error.issues[0]?.code ?? 'bad_request', status: 400 };
		}
		if (body.data.expected_db_name !== DB_NAME) {
			return { err_code: 'incorrect_env', status: 403 };
		}
		if (await limiter.check(event).then((r) => r.forbidden || r.limited)) {
			return { err_code: 'rate_limited', status: 429 };
		}
		if (expectedKey === '' || expectedKey !== body.data.cron_api_key) {
			return { err_code: 'incorrect_key', status: 403 };
		}

		const acceptsAnyIp = ipWhitelist.length === 1 && ipWhitelist[0]! === '*';
		if (acceptsAnyIp) return null;

		const ip = getClientAddress();

		const acceptsOnlyInternalIp = ipWhitelist.length === 1 && ipWhitelist[0]! === 'internal';
		if (acceptsOnlyInternalIp) {
			if (isInternalIpAddr(ip)) return null;
			return { err_code: 'incorrect_ip', status: 403 };
		}

		if (!ipWhitelist.includes(ip)) {
			return { err_code: 'incorrect_ip', status: 403 };
		}

		return null;
	})();

	if (err) {
		log('error', { id, address: getClientAddress(), err_code: err.err_code });
		return jsonFail(err.status);
	} else {
		const loggables = (await protectedFn()) ?? {};
		log('info', { id, address: getClientAddress(), ...loggables });
		return jsonOk();
	}
};
