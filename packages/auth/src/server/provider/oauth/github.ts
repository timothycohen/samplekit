import { z } from 'zod';
import { createServerCBUrlToOAuthCbData, createSetOAuthCookies } from './utils.js';
import type { Config, ServerAuthProviderOAuth } from '../../../types/server/index.js';

const dataSchema = z.object({
	email: z.string().nullable(),
	name: z.string(),
	avatar_url: z.string(),
});

const emailSchema = z.array(
	z.object({
		email: z.string(),
		primary: z.boolean(),
		verified: z.boolean(),
		visibility: z.string().nullable(),
	}),
);

// https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
export const createGithub = ({
	config,
}: {
	config: Pick<Config, 'env' | 'generateOAuthState' | 'generateOAuthCookieNames' | 'clean'>;
}): ServerAuthProviderOAuth => {
	const provider = 'github';
	const cookieNames = config.generateOAuthCookieNames(provider);
	const setOAuthCookies = createSetOAuthCookies({ cookieNames, secureCookie: config.env.secureCookie });

	return {
		createStatelessUrl: ({ clientId, redirectPathname }) => {
			const url = new URL('https://github.com/login/oauth/authorize');
			url.searchParams.set('scope', 'user:email');
			url.searchParams.set('client_id', clientId);
			url.searchParams.set('redirect_uri', `${config.env.PUBLIC_ORIGIN}/${redirectPathname}`);
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
					const res = await fetch('https://github.com/login/oauth/access_token', {
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
						body: new URLSearchParams({
							client_id: clientId,
							client_secret: clientSecret,
							code: authorizationCode,
							redirect_uri: `${config.env.PUBLIC_ORIGIN}/${redirectPathname}`,
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
					const [githubData, primaryEmail] = await Promise.all([
						fetch('https://api.github.com/user', {
							headers: { Authorization: `Bearer ${accessToken}` },
						})
							.then((res) => res.json())
							.then((json) => dataSchema.parse(json)),

						fetch('https://api.github.com/user/emails', {
							headers: {
								Authorization: `Bearer ${accessToken}`,
								Accept: 'application/vnd.github+json',
								'X-GitHub-Api-Version': '2022-11-28',
							},
						})
							.then((res) => res.json())
							.then((json) => emailSchema.parse(json).find(({ primary }) => primary)!.email),
					]);

					return {
						clean_email: config.clean.email(primaryEmail),
						given_name: githubData.name,
						family_name: '',
						picture: githubData.avatar_url,
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
