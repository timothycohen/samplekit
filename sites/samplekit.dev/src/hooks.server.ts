import '$lib/initServer';

import { type HandleServerError, type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { auth, createAuthMiddleware } from '$lib/auth/server';
import { logger } from '$lib/logging/server';

export type SessionHandler = ReturnType<
	(typeof import('./lib/auth/server/createAuth').auth)['createSessionHandler']
> & {
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

const populateLocals: Handle = async ({ event, resolve }) => {
	const seshHandler = auth.createSessionHandler(createAuthMiddleware({ event })) as SessionHandler;

	seshHandler.getVerifiedUser = async ({ skipCache }: { skipCache?: true } = {}) => {
		const seshUser = await event.locals.seshHandler.getSessionUser({ skipCache });

		if (!seshUser || seshUser.session.awaitingEmailVeri || seshUser.session.awaitingMFA) return null;

		return seshUser.user;
	};

	seshHandler.userOrRedirect = async ({ skipCache }: { skipCache?: true } = {}) => {
		const seshUser = await event.locals.seshHandler.getSessionUser({ skipCache });

		let loginPath: null | string = null;
		if (!seshUser) loginPath = '/login';
		else if (seshUser.session.awaitingEmailVeri) loginPath = '/email-verification';
		else if (seshUser.session.awaitingMFA) loginPath = '/login/verify-mfa';

		if (loginPath) {
			const url = new URL(loginPath, event.url.origin);
			url.searchParams.set('redirect_url', event.url.href.replace(event.url.origin, ''));
			return redirect(302, url);
		}

		return seshUser!;
	};

	event.locals.seshHandler = seshHandler;

	return await resolve(event);
};

export const handle = sequence(populateLocals);

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	const platform = event.request.headers.get('user-agent') ?? undefined;

	const ctx: Record<string, unknown> = {
		errorId,
		status,
		msg: message,
		pathname: event.url.pathname,
		...(platform ? { platform } : {}),
	};
	if (error instanceof Error) ctx['err'] = error;
	else ctx['error'] = error;

	logger.error(ctx);

	return { message, status, errorId };
};
