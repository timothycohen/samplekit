import { redirect } from '@sveltejs/kit';
import platform from 'platform';
import { GOOGLE_OAUTH_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { logger } from '$lib/logging/server';
import { PUBLIC_GOOGLE_OAUTH_LINK_PATHNAME } from '$routes/(auth)/consts';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const changeToGoogleProvider = async ({ url, cookies, locals, request, getClientAddress }: RequestEvent) => {
	const { user, session: oldSession } = await locals.seshHandler.userOrRedirect();

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	if (authDetails.method === 'oauth') return redirect(302, '/account/profile');
	if (authDetails.mfaCount) return redirect(302, '/account/profile');

	const res = await auth.provider.oauth.google.serverCBUrlToOAuthData({
		cookies,
		url,
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LINK_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
		clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
	});
	if (!res.success) {
		logger.error(res.error);
		return redirect(302, '/change-to-google?error=auth-failed');
	}

	if (res.data.clean_email !== user.email) {
		return redirect(302, '/change-to-google?error=email-mismatch');
	}

	const pf = platform.parse(request.headers.get('user-agent') ?? undefined);
	const [session] = await Promise.all([
		auth.session.deleteAll({ userId: user.id }).then(() =>
			auth.session.create(
				{
					userId: user.id,
					awaitingMFA: false,
					awaitingEmailVeri: false,
					persistent: oldSession.persistent,
				},
				{ os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() },
			),
		),
		auth.provider.changeToOAuth({ userId: user.id, provider: 'google' }),
		transports.sendEmail.changedProviderMethod({
			email: user.email,
			newProvider: { kind: 'oauth', provider: 'google' },
		}),
	]);

	locals.seshHandler.set({ session });

	return redirect(302, '/account/profile');
};

export const GET: RequestHandler = changeToGoogleProvider;
