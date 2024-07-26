import { getStoredThemeOnServer } from './themeUtils';
import type { Handle } from '@sveltejs/kit';

/**
 * Prevents FOUC by rendering the correct theme on the server according to user cookies.
 *
 * Will replace `updateThemeFromCookies` on the `<html>` tag in `app.html` with data-theme="${name}" class="no-js ${scheme}"
 *
 * Could instead compile the themeUtils and run `setThemeOnDoc(getStoredThemeOnClient)` in `app.html`
 *
 * */
export const updateThemeFromCookies: Handle = async ({ event, resolve }) => {
	if (event.request.method !== 'GET') return resolve(event);

	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			const { name, scheme } = getStoredThemeOnServer(event.cookies);

			return html.replace(
				/<html(\s+[^>]*)?\supdateThemeFromCookies(\s+[^>]*)?>/,
				`<html$1data-theme="${name}" class="no-js ${scheme}"$2>`,
			);
		},
	});

	return result;
};
