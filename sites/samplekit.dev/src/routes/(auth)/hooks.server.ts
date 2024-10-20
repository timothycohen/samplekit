import '$lib/initServer';

import { type Handle, redirect, type Cookies } from '@sveltejs/kit';
import { auth, createAuthMiddleware } from '$lib/auth/server';
import type { CheckedRoute } from '$lib/http/server';
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

	const getVerifiedUser: SessionHandler['getVerifiedUser'] = async ({ skipCache } = {}) => {
		const seshUser = await seshHandler.getSessionUser({ skipCache });
		if (!seshUser || seshUser.session.awaitingEmailVeri || seshUser.session.awaitingMFA) return null;
		return seshUser.user;
	};

	const userOrRedirect: SessionHandler['userOrRedirect'] = async ({ skipCache } = {}) => {
		const seshUser = await seshHandler.getSessionUser({ skipCache });
		if (!seshUser) return redirect(302, '/login' satisfies CheckedRoute);
		else if (seshUser.session.awaitingEmailVeri) return redirect(302, '/email-verification' satisfies CheckedRoute);
		else if (seshUser.session.awaitingMFA) return redirect(302, '/login/verify-mfa' satisfies CheckedRoute);
		return seshUser;
	};

	return Object.assign(seshHandler, { getVerifiedUser, userOrRedirect });
};

export const addSeshHandlerToLocals: Handle = async ({ event, resolve }) => {
	event.locals.seshHandler = createSeshHandler({ cookies: event.cookies });
	return await resolve(event);
};
