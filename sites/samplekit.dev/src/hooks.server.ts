import '$lib/initServer';

import { type HandleServerError } from '@sveltejs/kit';
import { logger } from '$lib/logging/server';

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
