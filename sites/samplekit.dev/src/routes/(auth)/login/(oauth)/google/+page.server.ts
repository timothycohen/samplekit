import { error, redirect, type Action } from '@sveltejs/kit';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME } from './consts';

export const load = () => {
	error(404);
};

const passToGoogleOAuth: Action = async ({ locals, cookies, request }) => {
	const formData = await request.formData();
	const persistent = formData.get('persistent') === 'true';

	if (await locals.seshHandler.getVerifiedUser()) return checkedRedirect('/account/profile');

	const googleLink = auth.provider.oauth.google.createStatelessUrl({
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
	});
	auth.provider.oauth.google.setState({ cookies, persistent, url: googleLink });

	return redirect(302, googleLink);
};

export const actions = { passToGoogleOAuth };
