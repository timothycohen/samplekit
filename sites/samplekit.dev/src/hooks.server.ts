import '$lib/initServer';

import { sequence } from '@sveltejs/kit/hooks';
import { logger, sentryHandle, handleErrorWithSentry } from '$lib/logging/server';
import { addSeshHandlerToLocals } from '$routes/(auth)/hooks.server';
import { handleAccountRedirects } from '$routes/account/hooks.server';
import { protectStagingDeployments } from '$routes/deployment-access/hooks.server';
import type { HandleServerError, Handle } from '@sveltejs/kit';

// https://github.com/sveltejs/kit/issues/8549
const deleteLinkHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.delete('link');
	return response;
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
