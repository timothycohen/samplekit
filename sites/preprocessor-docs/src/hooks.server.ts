import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { updateThemeFromCookies } from '$lib/styles';

const redirects: Handle = ({ event, resolve }) => {
	if (event.url.pathname === '/') redirect(302, '/docs/codeblocks');
	if (event.url.pathname === '/docs') redirect(302, '/docs/codeblocks');

	return resolve(event);
};

export const handle = sequence(redirects, updateThemeFromCookies);
