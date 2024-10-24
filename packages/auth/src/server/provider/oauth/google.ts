import { z } from 'zod';
import { createServerCBUrlToOAuthCbData, createSetOAuthCookies } from './utils.js';
import type { Config, ServerAuthProviderOAuth } from '../../../types/server/index.js';

const dataSchema = z.object({
	email: z.string(),
	given_name: z.string(),
	family_name: z.string(),
	picture: z.string(),
});

// https://developers.google.com/identity/protocols/oauth2/web-server
export const createGoogle = ({
	config,
}: {
	config: Pick<Config, 'env' | 'generateOAuthState' | 'generateOAuthCookieNames' | 'clean'>;
}): ServerAuthProviderOAuth => {
	const provider = 'google';
	const cookieNames = config.generateOAuthCookieNames(provider);
	const setOAuthCookies = createSetOAuthCookies({ cookieNames, secureCookie: config.env.secureCookie });

	return {
		createStatelessUrl: ({ clientId, redirectPathname }) => {
			const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
			url.searchParams.set('redirect_uri', `${config.env.PUBLIC_ORIGIN}/${redirectPathname}`);
			url.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile email');
			url.searchParams.set('client_id', clientId);
			url.searchParams.set('response_type', 'code');
			return url;
		},
		setState: ({ cookies, persistent, url }) => {
			const state = config.generateOAuthState();
			url.searchParams.set('state', state);
			setOAuthCookies({ cookies, state, persistent });
		},
		serverCBUrlToOAuthData: createServerCBUrlToOAuthCbData({
			fetchAccessToken: async ({ authorizationCode, redirectPathname, clientId, clientSecret }) => {
				try {
					const res = await fetch('https://oauth2.googleapis.com/token', {
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: new URLSearchParams({
							code: authorizationCode,
							client_id: clientId,
							grant_type: 'authorization_code',
							redirect_uri: `${config.env.PUBLIC_ORIGIN}/${redirectPathname}`,
							client_secret: clientSecret,
						}),
					});
					const tokens = await res.json();
					if (!tokens?.access_token) return { success: false, error: 'no_access_token' };
					return { success: true, accessToken: tokens.access_token };
				} catch {
					return { success: false, error: 'validation_failed' };
				}
			},
			fetchUser: async ({ accessToken }) => {
				try {
					const googleData = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
						headers: { Authorization: `Bearer ${accessToken}` },
					})
						.then((res) => res.json())
						.then((json) => dataSchema.parse(json));

					return {
						clean_email: config.clean.email(googleData.email),
						given_name: googleData.given_name,
						family_name: googleData.family_name,
						picture: googleData.picture,
					};
				} catch {
					return null;
				}
			},
			cookieNames,
			secureCookie: config.env.secureCookie,
			readUrl: (url) => ({ state: url.searchParams.get('state'), code: url.searchParams.get('code') }),
		}),
	};
};
