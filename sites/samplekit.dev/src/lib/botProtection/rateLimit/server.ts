import { type RateLimiterPlugin, type Rate, RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';
import { logger } from '$lib/logging/server';
import { toHumanReadableTime } from '$lib/utils/common';
import type { RequestEvent } from '@sveltejs/kit';

class UserIdRateLimiter implements RateLimiterPlugin {
	readonly rate: Rate;

	constructor(rate: Rate) {
		this.rate = rate;
	}

	async hash(event: RequestEvent) {
		return (await event.locals.seshHandler.getVerifiedUser())?.id || false;
	}
}

class GlobalRateLimiter implements RateLimiterPlugin {
	readonly rate: Rate;

	constructor(rate: Rate) {
		this.rate = rate;
	}

	async hash(_: RequestEvent) {
		return 'global';
	}
}

const transform = (id: string, res: RetryAfterRateLimiter) => {
	return {
		check: async (
			e: RequestEvent,
			opts: { skipHeader?: true; log?: Record<string, unknown> } = {},
		): Promise<
			{ retryAfter: number } & ({ limited: false; humanTryAfter?: never } | { limited: true; humanTryAfter: string })
		> => {
			const checked = await res.check(e);
			if (!checked.limited) return { limited: false, retryAfter: checked.retryAfter };
			const humanTryAfter = toHumanReadableTime(checked.retryAfter);
			if (!opts.skipHeader) {
				e.setHeaders({ 'Retry-After': checked.retryAfter.toString() });
			}
			if (opts.log) {
				logger.info({ code: 'rate-limit', limiter: id, ip: e.getClientAddress(), ...opts.log });
			}
			return { limited: true, retryAfter: checked.retryAfter, humanTryAfter };
		},
	};
};

export const createUserIdLimiter = ({ rate, id }: { rate: Rate; id: string }) =>
	transform(id, new RetryAfterRateLimiter({ plugins: [new UserIdRateLimiter(rate)], IP: rate, IPUA: rate }));

export const createDeviceLimiter = ({ rate, id }: { rate: Rate; id: string }) =>
	transform(id, new RetryAfterRateLimiter({ IP: rate, IPUA: rate }));

export const createGlobalLimit = ({ rate, id }: { rate: Rate; id: string }) =>
	transform(id, new RetryAfterRateLimiter({ plugins: [new GlobalRateLimiter(rate)] }));
