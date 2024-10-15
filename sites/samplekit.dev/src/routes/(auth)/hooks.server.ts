import '$lib/initServer';

import { type Handle, redirect, type Cookies } from '@sveltejs/kit';
import { auth, createAuthMiddleware } from '$lib/auth/server';
import type { ISessionHandler } from '@samplekit/auth/server';

export type SessionHandler = ISessionHandler<DB.User, DB.Session> & {
	/**
	 * if (logged in && email verified && not awaiting MFA) -> `User`
	 *
	 * else -> `null`
	 */
	getVerifiedUser: (a?: { skipCache?: true }) => Promise<null | DB.User>;
	/**
	 * if (logged in && email verified && not awaiting MFA) -> `User`
	 *
	 * else -> redirect
	 */
	userOrRedirect: (a?: { skipCache?: true }) => Promise<never | { user: DB.User; session: DB.Session }>;
};

const createSeshHandler = ({ cookies }: { cookies: Cookies }): SessionHandler => {
	const seshHandler = auth.createSessionHandler(createAuthMiddleware({ cookies }));

	const getVerifiedUser = async ({ skipCache }: { skipCache?: true } = {}) => {
		const seshUser = await seshHandler.getSessionUser({ skipCache });

		if (!seshUser || seshUser.session.awaitingEmailVeri || seshUser.session.awaitingMFA) return null;

		return seshUser.user;
	};

	const userOrRedirect = async ({ skipCache }: { skipCache?: true } = {}) => {
		const seshUser = await seshHandler.getSessionUser({ skipCache });

		let sanitizedPath: null | string = null;
		if (!seshUser) sanitizedPath = '/login';
		else if (seshUser.session.awaitingEmailVeri) sanitizedPath = '/email-verification';
		else if (seshUser.session.awaitingMFA) sanitizedPath = '/login/verify-mfa';

		if (sanitizedPath) {
			return redirect(302, sanitizedPath);
		}

		return seshUser!;
	};

	return Object.assign(seshHandler, { getVerifiedUser, userOrRedirect });
};

export const addSeshHandlerToLocals: Handle = async ({ event, resolve }) => {
	event.locals.seshHandler = createSeshHandler({ cookies: event.cookies });
	return await resolve(event);
};
