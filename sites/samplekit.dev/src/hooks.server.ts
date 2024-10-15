import '$lib/initServer';

import { sentryHandle, handleErrorWithSentry } from '@sentry/sveltekit';
import { type HandleServerError, type Handle, redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { logger } from '$lib/logging/server';
import { addSeshHandlerToLocals } from '$routes/(auth)/hooks.server';
import { handleAccountRedirects } from '$routes/account/hooks.server';
import { deploymentAccessController } from '$routes/deployment-access/controller';

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
		(event.route.id?.endsWith('.json') &&
			(await deploymentAccessController.isAuthenticated({ headers: event.request.headers }))) ||
		(await deploymentAccessController.isAuthenticated({ cookies: event.cookies }))
	)
		return resolve(event);

	return error(403, 'Forbidden');
};

export const handle = sequence(
	sentryHandle(),
	addSeshHandlerToLocals,
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
