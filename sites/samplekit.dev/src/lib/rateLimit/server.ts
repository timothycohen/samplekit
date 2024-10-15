// Credit: Inspiration from https://github.com/ciscoheat/sveltekit-rate-limiter/blob/main/src/lib/server/index.ts

import Redis from 'ioredis';
import { auth } from '$lib/auth/server';
import { kv } from '$lib/kv/server';
import { logger } from '$lib/logging/server';
import { assertUnreachable, pluralize, toHumanReadableTime } from '$lib/utils/common';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * The rate limiter is made from three parts.
 * 1. A consumer identifier determined from the request event. That might be ip, userId, global, ip + 'user-agent', etc.
 * 2. A store that maps the consumerId and its attempts wrapped in a controller to get, expire, add, and clear. The store might be in-memory, postgres, redis, etc.
 * 3. A rate limiting algorithm and its options. That might be sliding window, token bucket, etc.
 *
 * This implementation provides the following options:
 * store controllers: redis
 * algorithms: unweighted sliding window
 * limiters: ip, userId, global, ip + 'user-agent'
 */

// #region Consumer Identifiers ///////////////////////////////////////////////
export type ConsumerIdentifier = {
	kind: 'ip' | 'userId' | 'global' | 'ipUa';
	/** If we can't parse the event (for example userId when the user isn't logged in) the method returns false and the expectation is that the request will be blocked */
	calcId: (event: RequestEvent) => Promise<string | false>;
};

export const byIp: ConsumerIdentifier = {
	kind: 'ip',
	calcId: async (event: RequestEvent) => event.getClientAddress(),
};

export const byUserId: ConsumerIdentifier = {
	kind: 'userId',
	calcId: async (event: RequestEvent) => (await event.locals.seshHandler.getVerifiedUser())?.id || false,
};

export const byGlobal: ConsumerIdentifier = {
	kind: 'global',
	calcId: async (_: RequestEvent) => 'global',
};

export const byIpUa: ConsumerIdentifier = {
	kind: 'ipUa',
	calcId: async (event: RequestEvent) => {
		const ua = event.request.headers.get('user-agent');
		if (!ua) return false;
		return event.getClientAddress() + ua;
	},
};

/**
 * @throws {Error} Invalid consumer identifier kind
 */
export const parseConsumerIdOrThrow = (kind: ConsumerIdentifier['kind']): ConsumerIdentifier => {
	switch (kind) {
		case 'ip':
			return byIp;
		case 'userId':
			return byUserId;
		case 'global':
			return byGlobal;
		case 'ipUa':
			return byIpUa;
	}
	throw new Error('Invalid consumer identifier kind: ' + kind);
};
// #endregion Consumer Identifiers ////////////////////////////////////////////

// #region Store Controllers //////////////////////////////////////////////////
export interface Store {
	expireAndCount: (a: {
		key: string;
		removeOlderThan: number;
	}) => Promise<{ oldestRequestTs: number | null; requestCount: number }>;
	add: (a: Array<{ key: string; ttlMs: number }>) => Promise<void>;
	clear: (a: { keys: string[] }) => Promise<void>;
	kind: 'redis';
}

export const createRedisStore = (a: { client: Redis }): Store => {
	type TimeStamp = string;

	const expireAndCount: Store['expireAndCount'] = async ({ key, removeOlderThan }) => {
		return a.client
			.pipeline()
			.zremrangebyscore(key, 0, removeOlderThan)
			.zrange(key, 0, -1)
			.exec()
			.then((r) => (r as [[null, number], [null, TimeStamp[]]])[1][1])
			.then((requestTimestamps) => {
				const oldestRequestTs = requestTimestamps[0];
				const requestCount = requestTimestamps.length;
				return { oldestRequestTs: oldestRequestTs ? +oldestRequestTs : null, requestCount };
			});
	};

	const add: Store['add'] = async (arr) => {
		const now = Date.now();
		const pipe = a.client.pipeline();
		arr.forEach(({ key, ttlMs }) => {
			pipe.zadd(key, now, now.toString());
			pipe.expire(key, msToSeconds(ttlMs));
		});
		await pipe.exec();
	};

	const clear: Store['clear'] = async ({ keys }) => {
		await a.client.del(keys);
	};

	return { expireAndCount, add, clear, kind: 'redis' };
};

export const redisStore = createRedisStore({ client: kv });
// #endregion Store Controllers ///////////////////////////////////////////////

// #region Rate ///////////////////////////////////////////////////////////////
export type Time =
	| '100ms'
	| '250ms'
	| '500ms'
	| 's'
	| '2s'
	| '5s'
	| '10s'
	| '15s'
	| '30s'
	| '45s'
	| 'm'
	| '5m'
	| '15m'
	| '30m'
	| 'h'
	| '2h'
	| '6h'
	| '12h'
	| 'd';

/**
 * @throws {Error} Invalid time string
 */
export function timeToMs(unit: Time) {
	switch (unit) {
		case '100ms':
			return 100;
		case '250ms':
			return 250;
		case '500ms':
			return 500;
		case 's':
			return 1000;
		case '2s':
			return 2 * 1000;
		case '5s':
			return 5 * 1000;
		case '10s':
			return 10 * 1000;
		case '15s':
			return 15 * 1000;
		case '30s':
			return 30 * 1000;
		case '45s':
			return 45 * 1000;
		case 'm':
			return 60 * 1000;
		case '5m':
			return 5 * 60 * 1000;
		case '15m':
			return 15 * 60 * 1000;
		case '30m':
			return 30 * 60 * 1000;
		case 'h':
			return 60 * 60 * 1000;
		case '2h':
			return 2 * 60 * 60 * 1000;
		case '6h':
			return 6 * 60 * 60 * 1000;
		case '12h':
			return 12 * 60 * 60 * 1000;
		case 'd':
			return 24 * 60 * 60 * 1000;
	}
	throw new Error('Invalid time string: ' + unit);
}

export function msToSeconds(ms: number) {
	return Math.max(0, Math.floor(ms / 1000));
}

export type Rate = [number, Time | number];
/**
 * @throws {Error} Not positive rate or invalid time
 */
export function parseRateOrThrow(rate: Rate): { maxAllowed: number; windowSizeMs: number } {
	const maxAllowed = rate[0];
	if (typeof maxAllowed !== 'number' || maxAllowed <= 0 || !Number.isInteger(maxAllowed)) {
		throw new Error('Invalid positive rate: ' + maxAllowed);
	}

	const rateUnit = typeof rate[1] === 'number' ? rate[1] : timeToMs(rate[1]);

	return { maxAllowed, windowSizeMs: rateUnit };
}
// #endregion Rate ////////////////////////////////////////////////////////////

// #region Rate Limiting Algorithms ///////////////////////////////////////////
interface RateLimiter {
	// prettier-ignore
	check: (event: RequestEvent, opts?: { skipHeader?: true; log?: Record<string, unknown> | null }) => Promise<
		| { limited: false;  forbidden?: never; limiterKind?: never;                     attemptsRemaining: number; humanAttemptsRemaining: string; retryAfterSec?: never; humanTryAfter?: never }
		| { limited: true;   forbidden?: never; limiterKind: ConsumerIdentifier['kind']; attemptsRemaining?: never; humanAttemptsRemaining?: never; retryAfterSec: number; humanTryAfter: (tooManyWord: string) => string }
		| { limited?: never; forbidden: true;   limiterKind: ConsumerIdentifier['kind']; attemptsRemaining?: never; humanAttemptsRemaining?: never; retryAfterSec?: never; humanTryAfter?: never }
	>;
	clear: (event: RequestEvent) => Promise<void>;
}

/**
 * This takes in an array of limiters.
 *
 * Each limiter has a rate [`r` requests, `t` time] and a function to identify the consumer.
 *
 * The algorithm exposes a `check` method which allows `r` requests within any `t` time period for each consumer.
 *
 * If any of the limiters cannot be calculated (for example a `userId` when the user isn't logged in) the request is forbidden.
 *
 * If any of the limiters are limited (because more requests have come in than `r` within the last time `t`), the request is limited.
 *
 * Otherwise, all the limiter counts are incremented.
 *
 * `attemptsRemaining` is the minimum of all the limiters' remaining attempts.
 *
 * - ex: if `limiter1` has 3 attempts remaining and `limiter2` has 5 attempts remaining, `attemptsRemaining` is 3
 *
 * `retryAfter` is the time until the most limited limiter is no longer limited.
 *
 * - ex: if `limiter1` is not limited, `limiter2` is limited for 30 mins, and `limiter3` is limited for 10 mins, `retryAfter` is 30 minutes
 *
 * Each limiter has its own rate because we can combine them.
 * Examples:
 * 1) `UserIpUaLimiter` with a userId rate of `[5, '15m']` and a ipUa rate of `[7, '15m']` – if a user submits 5 requests, logs out, logs in as a different user, and submits 3 more requests, the 8th request will be limited.
 * 2) `IpUa` limiter with ipUa rate of `[2, '15m'], and another ipUa rate of [5, 'd']. The first 5 will be limited to two per 15m, but the 6th within a day will be throttled.
 */
export const createUnweightedSlidingWindow = (a: {
	limiters: { kind: ConsumerIdentifier['kind']; rate: Rate }[];
	store: Store;
	logBase?: Record<string, unknown>;
	id: string;
}): RateLimiter => {
	type ParsedLimiter = {
		calcStorageKey: (event: RequestEvent) => Promise<string | null>;
		maxAllowed: number;
		windowSizeMs: number;
		kind: ConsumerIdentifier['kind'];
	};

	type KeyAndRate = {
		storageKey: string;
		maxAllowed: number; // > 0
		windowSizeMs: number;
		limiterKind: ConsumerIdentifier['kind'];
	};

	const parsedLimiters: ParsedLimiter[] = (() => {
		const kind = a.store.kind;

		switch (kind) {
			case 'redis':
				return a.limiters.map((l) => {
					const { calcId, kind } = parseConsumerIdOrThrow(l.kind);
					const { maxAllowed, windowSizeMs } = parseRateOrThrow(l.rate);

					const calcStorageKey = async (event: RequestEvent) => {
						const consumerId = await calcId(event);
						if (!consumerId) return null;
						return `rl:${a.id}:${kind}:${maxAllowed}_${windowSizeMs}:${consumerId}`;
					};

					return { maxAllowed, windowSizeMs, calcStorageKey, kind };
				});
		}

		assertUnreachable(kind);
	})();

	const getMostLimitedMethod = async ({
		keyAndRates,
	}: {
		keyAndRates: KeyAndRate[];
	}): Promise<
		| { limited: true; limitedKey: string; timeToUnlimitMs: number; limiterKind: ConsumerIdentifier['kind'] }
		| { limited: false; attemptsRemaining: number }
	> => {
		const now = Date.now();

		let res:
			| { limited: true; limitedKey: string; timeToUnlimitMs: number; limiterKind: ConsumerIdentifier['kind'] }
			| { limited: false } = { limited: false };
		let attemptsRemaining = Infinity;

		for (const { storageKey, maxAllowed, windowSizeMs, limiterKind } of keyAndRates) {
			const { oldestRequestTs, requestCount } = await a.store.expireAndCount({
				key: storageKey,
				removeOlderThan: now - windowSizeMs,
			});

			const thisMethodRemaining = maxAllowed - requestCount;
			const thisMethodLimited = thisMethodRemaining <= 0;
			attemptsRemaining = Math.min(attemptsRemaining, thisMethodRemaining);

			if (thisMethodLimited) {
				// SAFETY: maxAllowed is positive, therefore being limited implies there was a previous request and oldestRequestTs is not null
				const thisMethodTimeToUnlimitMs = oldestRequestTs! + windowSizeMs - now;
				if (!res.limited || thisMethodTimeToUnlimitMs > res.timeToUnlimitMs) {
					res = { limiterKind, limitedKey: storageKey, timeToUnlimitMs: thisMethodTimeToUnlimitMs, limited: true };
				}
			}
		}

		if (!res.limited) return { limited: false, attemptsRemaining: attemptsRemaining - 1 };
		return res;
	};

	const check: RateLimiter['check'] = async (event, opts = { log: {} }) => {
		const keyAndRates: KeyAndRate[] = [];

		for (const limiter of parsedLimiters) {
			const storageKey = await limiter.calcStorageKey(event);
			if (!storageKey || limiter.maxAllowed <= 0) {
				return { forbidden: true, limiterKind: limiter.kind };
			}
			keyAndRates.push({
				maxAllowed: limiter.maxAllowed,
				windowSizeMs: limiter.windowSizeMs,
				storageKey,
				limiterKind: limiter.kind,
			});
		}

		const checkedMethods = await getMostLimitedMethod({ keyAndRates });

		if (!checkedMethods.limited) {
			await a.store.add(keyAndRates.map((l) => ({ key: l.storageKey, ttlMs: l.windowSizeMs })));
			return {
				...checkedMethods,
				humanAttemptsRemaining: `${checkedMethods.attemptsRemaining} ${pluralize('attempt', checkedMethods.attemptsRemaining)} remaining.`,
			};
		}

		const { limitedKey, timeToUnlimitMs, limiterKind } = checkedMethods;

		const retryAfterSec = msToSeconds(timeToUnlimitMs);
		if (!opts.skipHeader && retryAfterSec !== Infinity) event.setHeaders({ 'Retry-After': retryAfterSec.toString() });
		if (opts.log) {
			logger.info({ code: 'rate-limit', limitedKey, id: a.id, ...a.logBase, ...opts.log });
		}
		return {
			limited: true,
			limiterKind,
			retryAfterSec,
			humanTryAfter: (tooManyWord: string) =>
				`Too many ${tooManyWord}. Please try again in ${toHumanReadableTime(retryAfterSec)}.`,
		};
	};

	const clear: RateLimiter['clear'] = async (event) => {
		const storageKeys = await Promise.all(parsedLimiters.map(async (limiter) => limiter.calcStorageKey(event)));
		const keys = storageKeys.filter(Boolean) as string[];
		await a.store.clear({ keys });
	};

	return { check, clear };
};
// #endregion Rate Limiting Algorithms ////////////////////////////////////////

// #region Common Rate Limiter Factories //////////////////////////////////////
export const createLimiter = (a: {
	id?: string;
	limiters: { kind: ConsumerIdentifier['kind']; rate: Rate }[];
	logBase?: Record<string, unknown>;
}) =>
	createUnweightedSlidingWindow({
		limiters: a.limiters,
		store: redisStore,
		logBase: a.logBase,
		id: a.id ?? auth.config.generateId(),
	});
// #endregion Common Rate Limiter Factories ///////////////////////////////////
