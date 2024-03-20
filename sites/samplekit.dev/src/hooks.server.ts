import '$lib/initServer';

import { sentryHandle, handleErrorWithSentry } from '@sentry/sveltekit';
import { type HandleServerError, type Handle, redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { auth, createAuthMiddleware } from '$lib/auth/server';
import { logger } from '$lib/logging/server';
import { handleAccountRedirects } from '$routes/account/hooks.server';
import { deploymentAccessController } from '$routes/deployment-access/controller';

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

		let sanitizedPath: null | string = null;
		if (!seshUser) sanitizedPath = '/login';
		else if (seshUser.session.awaitingEmailVeri) sanitizedPath = '/email-verification';
		else if (seshUser.session.awaitingMFA) sanitizedPath = '/login/verify-mfa';

		if (sanitizedPath) {
			return redirect(302, sanitizedPath);
		}

		return seshUser!;
	};

	event.locals.seshHandler = seshHandler;

	return await resolve(event);
};

// https://github.com/sveltejs/kit/issues/8549
const deleteLinkHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.delete('link');
	return response;
};

const protectStagingDeployments: Handle = async ({ event, resolve }) => {
	if (PUBLIC_ORIGIN === 'https://www.samplekit.dev') {
		if (event.url.pathname === '/deployment-access') return redirect(302, '404');
		return resolve(event);
	}
	if (
		dev ||
		PUBLIC_ORIGIN.startsWith('http://localhost:') ||
		event.url.pathname === '/deployment-access' ||
		(await deploymentAccessController.isAuthenticated({ cookies: event.cookies }))
	)
		return resolve(event);

	return error(403, 'Forbidden');
};

export const handle = sequence(
	sentryHandle(),
	populateLocals,
	protectStagingDeployments,
	handleAccountRedirects,
	deleteLinkHeaders,
);

export const handleError: HandleServerError = handleErrorWithSentry(async ({ error, event, status, message }) => {
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
});
