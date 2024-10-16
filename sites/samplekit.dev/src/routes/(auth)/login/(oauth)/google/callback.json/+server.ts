import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { GOOGLE_OAUTH_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { getDeviceInfo } from '$lib/device-info';
import { checkedRedirect } from '$lib/http/server';
import { PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME } from '$routes/(auth)/consts';

const loginWithGoogle: RequestHandler = async ({ url, cookies, locals, request, getClientAddress }) => {
	if (await locals.seshHandler.getVerifiedUser()) return checkedRedirect('/account/profile');

	const res = await auth.provider.oauth.google.serverCBUrlToOAuthData({
		url,
		cookies,
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
		clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
	});
	if (!res.success) {
		error(403, res.error);
	}

	const { user, error: authError } = await auth.user.getOrCreateOAuth(res.data, 'google');
	if (authError) return redirect(302, '/oauth-sign-in/google');

	const session = await auth.session.create(
		{
			userId: user.id,
			awaitingMFA: false,
			awaitingEmailVeri: false,
			persistent: res.wantsPersistentSession,
		},
		getDeviceInfo({ headers: request.headers, getClientAddress }),
	);
	locals.seshHandler.set({ session });

	return checkedRedirect('/account/profile');
};

export const GET = loginWithGoogle;
