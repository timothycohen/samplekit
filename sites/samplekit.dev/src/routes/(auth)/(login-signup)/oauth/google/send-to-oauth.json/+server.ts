import { redirect } from '@sveltejs/kit';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME } from '../consts';
import type { RequestHandler } from './$types';

const passToGoogleOAuth: RequestHandler = async ({ locals, cookies, request }) => {
	const formData = await request.formData().catch(() => new FormData());
	const persistent = formData.get('persistent') === 'true';

	if (await locals.seshHandler.getVerifiedUser()) return checkedRedirect('/account/profile');

	const googleLink = auth.provider.oauth.google.createStatelessUrl({
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
	});
	auth.provider.oauth.google.setState({ cookies, persistent, url: googleLink });

	return redirect(302, googleLink);
};

export const POST = passToGoogleOAuth;
