import { z } from 'zod';
import { createServerCBUrlToOAuthCbData, setOAuthCookies } from './utils.js';
import type {
	CreateFetchOAuthAccessToken,
	CreateFetchOAuthUserData,
	CreateOAuth,
	CreateOAuthStatelessUrl,
	CreateSetOAuthState,
	ReadUrl,
} from './utils.js';
import type { Config } from '../../types/index.js';

const createOAuthStatelessUrl: CreateOAuthStatelessUrl =
	({ PUBLIC_ORIGIN }) =>
	({ clientId, redirectPathname }) => {
		const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
		url.searchParams.set('redirect_uri', `${PUBLIC_ORIGIN}/${redirectPathname}`);
		url.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile email');
		url.searchParams.set('client_id', clientId);
		url.searchParams.set('response_type', 'code');
		return url;
	};

const createSetOAuthState: CreateSetOAuthState =
	({ generateOAuthState, cookieNames, secureCookie }) =>
	({ cookies, persistent, url }) => {
		const state = generateOAuthState();
		url.searchParams.set('state', state);
		setOAuthCookies({ cookieNames, secureCookie })({ cookies, state, persistent });
	};

const createFetchOAuthAccessToken: CreateFetchOAuthAccessToken =
	({ PUBLIC_ORIGIN }) =>
	async ({ authorizationCode, redirectPathname, clientId, clientSecret }) => {
		try {
			const res = await fetch('https://oauth2.googleapis.com/token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					code: authorizationCode,
					client_id: clientId,
					grant_type: 'authorization_code',
					redirect_uri: `${PUBLIC_ORIGIN}/${redirectPathname}`,
					client_secret: clientSecret,
				}),
			});
			const tokens = await res.json();
			if (!tokens?.access_token) return { success: false, error: 'no_access_token' };
			return { success: true, accessToken: tokens.access_token };
		} catch {
			return { success: false, error: 'validation_failed' };
		}
	};

const dataSchema = z.object({
	email: z.string(),
	given_name: z.string(),
	family_name: z.string(),
	picture: z.string(),
});

const createFetchUserData: CreateFetchOAuthUserData =
	({ cleanEmail }) =>
	async ({ accessToken }) => {
		try {
			const googleData = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: { Authorization: `Bearer ${accessToken}` },
			})
				.then((res) => res.json())
				.then((json) => dataSchema.parse(json));

			return {
				clean_email: cleanEmail(googleData.email),
				given_name: googleData.given_name,
				family_name: googleData.family_name,
				picture: googleData.picture,
			};
		} catch {
			return null;
		}
	};

const readUrl: ReadUrl = (url) => ({ state: url.searchParams.get('state'), code: url.searchParams.get('code') });

// https://developers.google.com/identity/protocols/oauth2/web-server
export const createGoogle = ({
	config,
}: {
	config: Pick<Config, 'env' | 'generateOAuthState' | 'generateOAuthCookieNames' | 'clean'>;
}): CreateOAuth => {
	const provider = 'google';

	return {
		createStatelessUrl: createOAuthStatelessUrl({ PUBLIC_ORIGIN: config.env.PUBLIC_ORIGIN }),
		setState: createSetOAuthState({
			cookieNames: config.generateOAuthCookieNames(provider),
			secureCookie: config.env.secureCookie,
			generateOAuthState: config.generateOAuthState,
		}),
		serverCBUrlToOAuthData: createServerCBUrlToOAuthCbData({
			fetchAccessToken: createFetchOAuthAccessToken({ PUBLIC_ORIGIN: config.env.PUBLIC_ORIGIN }),
			fetchUser: createFetchUserData({ cleanEmail: config.clean.email }),
			cookieNames: config.generateOAuthCookieNames(provider),
			secureCookie: config.env.secureCookie,
			readUrl,
		}),
	};
};
