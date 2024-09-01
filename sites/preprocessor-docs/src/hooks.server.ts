// Note: this file will not be used in the adapter-static build
// configure redirects in nginx-default.conf

import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const redirects: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const res = await resolve(event);
	if (res.status === 404) {
		if (pathname === '/' || pathname.startsWith('/docs')) {
			return redirect(302, '/docs/code-decoration/');
		}
	}
	return res;
};

export const handle = sequence(redirects);
