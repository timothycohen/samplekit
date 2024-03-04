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
	const accessTokenPrefix = `da:${PUBLIC_ORIGIN}:deployment-token:`;
	const sessionIdPrefix = `da:${PUBLIC_ORIGIN}:deployment-session:`;
	const sessionRefreshThreshold = 60 * 60 * 24 * 4;
	const sessionTtl = 60 * 60 * 24 * 14;

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

	/** Refreshes the expiration date to sessionTtl if it's less than sessionRefreshThreshold. */
	const sessionIdIsStored = async ({ sessionId }: { sessionId: string }): Promise<boolean> => {
		const redisPath = sessionIdPrefix + sessionId;
		const res = (await redis().pipeline().get(redisPath).ttl(redisPath).exec()) as [
			[null, string | null],
			[null, number],
		];
		const ownerId = res[0][1];
		if (!ownerId) return false;
		const ttl = res[1][1];
		if (ttl < sessionRefreshThreshold) await redis().expire(redisPath, ttl);
		return !!ownerId;
	};

	/** Sets the expiration date to sessionTtl. */
	const setSessionId = async ({ sessionId, ownerId }: { sessionId: string; ownerId: string }): Promise<void> => {
		const redisPath = sessionIdPrefix + sessionId;
		await redis().pipeline().set(redisPath, ownerId).expire(redisPath, sessionTtl).exec();
	};

	const rmSessionId = async ({ sessionId }: { sessionId: string }): Promise<void> => {
		const redisPath = sessionIdPrefix + sessionId;
		await redis().del(redisPath);
	};

	return {
		accessToken: {
			getOwnerId: getAccessTokenOwnerId,
		},
		session: {
			isStored: sessionIdIsStored,
			set: setSessionId,
			rm: rmSessionId,
		},
	};
})();

export const deploymentAccessController = (() => {
	const isAuthenticated = async ({ cookies }: { cookies: Cookies }): Promise<boolean> => {
		const clientSessionId = cookieSessionController.get({ cookies });
		if (!clientSessionId) return false;

		const clientSessionIdStoredOnServer = await kvController.session.isStored({ sessionId: clientSessionId });
		if (!clientSessionIdStoredOnServer) {
			cookieSessionController.rm({ cookies });
			return false;
		}

		return true;
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

	return { isAuthenticated, createSession: createSessionWithAccessToken, deleteSession };
})();
