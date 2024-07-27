// Note: this file will not be used in adapter-static
// redirects will need to be done with the nginx config

import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { LayoutRouteId } from './routes/$types';

const routes: LayoutRouteId[] = ['/docs/code-decoration', '/docs/markdown', '/docs/math'];

const redirects: Handle = async ({ event, resolve }) => {
	let pathname = event.url.pathname;
	if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
	if (!routes.includes(pathname as LayoutRouteId)) return redirect(302, '/docs/code-decoration');
	return resolve(event);
};

export const handle = sequence(redirects);
