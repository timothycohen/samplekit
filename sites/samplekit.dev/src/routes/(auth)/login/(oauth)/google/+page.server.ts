import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME } from '$routes/(auth)/consts';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
	error(404);
};

const passToGoogleOAuth: Action = async ({ locals, cookies, request }) => {
	const formData = await request.formData();
	const persistent = formData.get('persistent') === 'true';

	if (await locals.seshHandler.getVerifiedUser()) return redirect(302, '/account/profile');

	const googleLink = auth.provider.oauth.google.createStatelessUrl({
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
	});
	auth.provider.oauth.google.setState({ cookies, persistent, url: googleLink });

	return redirect(302, googleLink);
};

export const actions: Actions = { passToGoogleOAuth };
