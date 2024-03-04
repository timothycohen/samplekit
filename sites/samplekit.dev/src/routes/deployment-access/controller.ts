import { Redis } from 'ioredis';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { logger } from '$lib/logging/server';
import type { Cookies } from '@sveltejs/kit';

const generateToken = () =>
	auth.config.randomString.generate({ size: 36, alphabet: auth.config.randomString.alphabet.default });

const cookieSessionController = (() => {
	const sessionCookKey = `deployment-session`;

	const get = ({ cookies }: { cookies: Cookies }) => {
		return cookies.get(sessionCookKey);
	};

	const set = ({ cookies, value }: { cookies: Cookies; value: string }) => {
		cookies.set(sessionCookKey, value, {
			path: '/',
			sameSite: 'lax',
			secure: true,
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
		});
	};

	const rm = ({ cookies }: { cookies: Cookies }) => {
		cookies.delete(sessionCookKey, { path: '/', sameSite: 'lax', secure: true, httpOnly: true });
	};

	return { get, set, rm };
})();

const kvController = (() => {
	const accessTokenPrefix = `da:${PUBLIC_ORIGIN}:token:`;
	const sessionIdPrefix = `da:${PUBLIC_ORIGIN}:session:`;
	const ownerIdToSessionsPrefix = `da:${PUBLIC_ORIGIN}:sessions-for:`;
	const ownerIdToAccessTokensPrefix = `da:${PUBLIC_ORIGIN}:tokens-for:`;
	const sessionRefreshThresholdSec = 60 * 60 * 24 * 4;
	const sessionTtlSec = 60 * 60 * 24 * 14;

	const redis = (() => {
		let client: Redis | null = null;

		return () => {
			if (client) return client;

			const REDIS_PASSWORD = process.env['TOKEN_CONTROLLER_PW'];
			if (!REDIS_PASSWORD) throw new Error('dynamic env TOKEN_CONTROLLER_PW is required');

			const REDIS_PORT = process.env['TOKEN_CONTROLLER_PORT'];
			if (!REDIS_PORT) throw new Error('dynamic env TOKEN_CONTROLLER_PORT is required');

			const REDIS_HOST = process.env['TOKEN_CONTROLLER_HOST'];
			if (!REDIS_HOST) throw new Error('dynamic env TOKEN_CONTROLLER_HOST is required');

			client = new Redis({ password: REDIS_PASSWORD, port: +REDIS_PORT, host: REDIS_HOST });

			logger.info('Connected to Deployment Access Redis');
			return client!;
		};
	})();

	const getAccessTokenOwnerId = async ({ token }: { token: string }): Promise<string | null> => {
		const redisPath = accessTokenPrefix + token;
		return await redis().get(redisPath);
	};

	const getTokensByOwnerId = async ({ ownerId }: { ownerId: string }): Promise<string[] | null> => {
		const setKey = ownerIdToAccessTokensPrefix + ownerId;
		const tokens = await redis().smembers(setKey);
		if (tokens.length === 0) return null;
		return tokens;
	};

	const setAccessToken = async ({ token, ownerId }: { token: string; ownerId: string }): Promise<void> => {
		const redisPath = accessTokenPrefix + token;
		const setKey = ownerIdToAccessTokensPrefix + ownerId;
		await redis().pipeline().set(redisPath, ownerId).sadd(setKey, token).exec();
	};

	const rmAccessToken = async ({ token }: { token: string }): Promise<void> => {
		const redisPath = accessTokenPrefix + token;
		const ownerId = await redis().get(redisPath);
		if (ownerId) {
			const setKey = ownerIdToAccessTokensPrefix + ownerId;
			await redis().pipeline().del(redisPath).srem(setKey, token).exec();
		}
	};

	const rmAccessTokensByOwnerId = async ({ ownerId }: { ownerId: string }): Promise<void> => {
		const setKey = ownerIdToAccessTokensPrefix + ownerId;
		const tokens = await redis().smembers(setKey);
		if (tokens.length > 0) {
			await redis()
				.pipeline(tokens.map((token) => ['del', accessTokenPrefix + token]))
				.del(setKey)
				.exec();
		}
	};

	/** Refreshes the expiration date to sessionTtl if it's less than sessionRefreshThresholdSec. */
	const getSessionOwnerId = async ({ sessionId }: { sessionId: string }): Promise<string | null> => {
		const redisPath = sessionIdPrefix + sessionId;
		const res = (await redis().pipeline().get(redisPath).ttl(redisPath).exec()) as [
			[null, string | null],
			[null, number],
		];
		const ownerId = res[0][1];
		if (!ownerId) return null;
		const ttl = res[1][1];
		if (ttl < sessionRefreshThresholdSec) await redis().expire(redisPath, ttl);
		return ownerId;
	};

	const getSessionsByOwnerId = async ({ ownerId }: { ownerId: string }): Promise<string[] | null> => {
		const setKey = ownerIdToSessionsPrefix + ownerId;
		const sessionIds = (
			(await redis()
				.pipeline()
				.zremrangebyscore(setKey, 0, Date.now() - sessionTtlSec * 1000)
				.zrange(setKey, 0, -1)
				.exec()) as [[null, number], [null, string[]]]
		)[1][1];

		if (sessionIds.length === 0) return null;
		return sessionIds;
	};

	/** Sets the expiration date to sessionTtl. */
	const setSession = async ({ sessionId, ownerId }: { sessionId: string; ownerId: string }): Promise<void> => {
		const redisPath = sessionIdPrefix + sessionId;
		const setKey = ownerIdToSessionsPrefix + ownerId;
		await redis()
			.pipeline()
			.set(redisPath, ownerId)
			.expire(redisPath, sessionTtlSec)
			.zadd(setKey, Date.now(), sessionId)
			.exec();
	};

	const rmSession = async ({ sessionId }: { sessionId: string }): Promise<void> => {
		const redisPath = sessionIdPrefix + sessionId;
		const ownerId = await redis().get(redisPath);
		if (ownerId) {
			const setKey = ownerIdToSessionsPrefix + ownerId;
			await redis().pipeline().del(redisPath).zrem(setKey, sessionId).exec();
		}
	};

	const rmSessionsByOwnerId = async ({ ownerId }: { ownerId: string }): Promise<void> => {
		const setKey = ownerIdToSessionsPrefix + ownerId;
		const sessionIds = await redis().zrange(setKey, 0, -1);
		if (sessionIds.length > 0) {
			await redis()
				.pipeline(sessionIds.map((sessionId) => ['del', sessionIdPrefix + sessionId]))
				.del(setKey)
				.exec();
		}
	};

	return {
		accessToken: {
			getOwnerId: getAccessTokenOwnerId,
			getAllByOwnerId: getTokensByOwnerId,
			set: setAccessToken,
			rm: rmAccessToken,
			rmAllByOwnerId: rmAccessTokensByOwnerId,
		},
		session: {
			getOwnerId: getSessionOwnerId,
			getAllByOwnerId: getSessionsByOwnerId,
			set: setSession,
			rm: rmSession,
			rmAllByOwnerId: rmSessionsByOwnerId,
		},
	};
})();

export const deploymentAccessController = (() => {
	const isAuthenticated = async ({ cookies }: { cookies: Cookies }): Promise<boolean> => {
		const clientSessionId = cookieSessionController.get({ cookies });
		if (!clientSessionId) return false;

		const clientSessionIdStoredOnServer = !!(await kvController.session.getOwnerId({ sessionId: clientSessionId }));
		if (!clientSessionIdStoredOnServer) {
			cookieSessionController.rm({ cookies });
			return false;
		}

		return true;
	};

	const countAuthenticatedSessions = async ({
		cookies,
	}: {
		cookies: Cookies;
	}): Promise<{ authenticated: false } | { authenticated: true; sessionCount: number }> => {
		const clientSessionId = cookieSessionController.get({ cookies });
		if (!clientSessionId) return { authenticated: false };

		const ownerId = await kvController.session.getOwnerId({ sessionId: clientSessionId });
		if (!ownerId) {
			cookieSessionController.rm({ cookies });
			return { authenticated: false };
		}

		const sessionCount = (await kvController.session.getAllByOwnerId({ ownerId }))?.length ?? 0;
		return { authenticated: true, sessionCount };
	};

	const createSession = async ({
		ownerId,
		cookies,
	}: {
		ownerId: string;
		cookies: Cookies;
	}): Promise<{ sessionId: string }> => {
		const sessionId = generateToken();
		await kvController.session.set({ sessionId, ownerId });
		cookieSessionController.set({ cookies, value: sessionId });
		return { sessionId };
	};

	const deleteSession = async ({ cookies }: { cookies: Cookies }): Promise<void> => {
		const clientSessionId = cookieSessionController.get({ cookies });
		if (!clientSessionId) return;
		cookieSessionController.rm({ cookies });
		await kvController.session.rm({ sessionId: clientSessionId });
	};

	const deleteAllSessions = async ({ cookies }: { cookies: Cookies }): Promise<void> => {
		const clientSessionId = cookieSessionController.get({ cookies });
		if (!clientSessionId) return;
		cookieSessionController.rm({ cookies });
		const ownerId = await kvController.session.getOwnerId({ sessionId: clientSessionId });
		if (!ownerId) return;
		await kvController.session.rmAllByOwnerId({ ownerId });
	};

	const createSessionWithAccessToken = async ({
		accessToken,
		cookies,
	}: {
		accessToken: string;
		cookies: Cookies;
	}): Promise<{ success: boolean }> => {
		const ownerId = await kvController.accessToken.getOwnerId({ token: accessToken });
		if (!ownerId) return { success: false };
		await createSession({ ownerId, cookies });
		return { success: true };
	};

	return {
		isAuthenticated,
		createSession: createSessionWithAccessToken,
		deleteSession,
		deleteAllSessions,
		countAuthenticatedSessions,
	};
})();
