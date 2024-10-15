import { type Handle, redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { deploymentAccessController } from '$routes/deployment-access/controller';

export const protectStagingDeployments: Handle = async ({ event, resolve }) => {
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
