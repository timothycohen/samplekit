import { error, redirect } from '@sveltejs/kit';
import platform from 'platform';
import { GOOGLE_OAUTH_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { PUBLIC_GOOGLE_OAUTH_LOGIN_PATHNAME } from '$routes/(auth)/consts';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const loginWithGoogle = async ({ url, cookies, locals, request, getClientAddress }: RequestEvent) => {
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

	const pf = platform.parse(request.headers.get('user-agent') ?? undefined);
	const session = await auth.session.create(
		{
			userId: user.id,
			awaitingMFA: false,
			awaitingEmailVeri: false,
			persistent: res.wantsPersistentSession,
		},
		{ os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() },
	);
	locals.seshHandler.set({ session });

	return checkedRedirect('/account/profile');
};

export const GET: RequestHandler = loginWithGoogle;
