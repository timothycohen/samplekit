import { getStoredThemeOnServer } from './colorThemeUtils';
import type { Handle } from '@sveltejs/kit';

/** Expects app.html `<html updateThemeFromCookies>` */
export const updateThemeFromCookies: Handle = async ({ event, resolve }) => {
	if (event.request.method !== 'GET') return resolve(event);

	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			const { name, scheme } = getStoredThemeOnServer(event.cookies);

			return html.replace(
				/<html updateThemeFromCookies>/,
				`<html lang="en" data-theme="${name}" class="no-js ${scheme}">`,
			);
		},
	});

	return result;
};
