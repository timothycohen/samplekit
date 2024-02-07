import type { RouteId } from './$types';
import type { Handle } from '@sveltejs/kit';

export const handleAccountRedirects: Handle = async ({ event, resolve }) => {
	const layoutId: RouteId = '/account';
	if (event.url.pathname.startsWith(layoutId)) await event.locals.seshHandler.userOrRedirect();
	return await resolve(event);
};
