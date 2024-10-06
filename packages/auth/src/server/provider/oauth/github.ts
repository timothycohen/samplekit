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
		const url = new URL('https://github.com/login/oauth/authorize');
		url.searchParams.set('scope', 'user:email');
		url.searchParams.set('client_id', clientId);
		url.searchParams.set('redirect_uri', `${PUBLIC_ORIGIN}/${redirectPathname}`);
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
			const res = await fetch('https://github.com/login/oauth/access_token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code: authorizationCode,
					redirect_uri: `${PUBLIC_ORIGIN}/${redirectPathname}`,
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

const createFetchUserData: CreateFetchOAuthUserData =
	({ cleanEmail }) =>
	async ({ accessToken }) => {
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
				clean_email: cleanEmail(primaryEmail),
				given_name: githubData.name,
				family_name: '',
				picture: githubData.avatar_url,
			};
		} catch {
			return null;
		}
	};

const readUrl: ReadUrl = (url) => ({ state: url.searchParams.get('state'), code: url.searchParams.get('code') });

// https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
export const createGithub = ({
	config,
}: {
	config: Pick<Config, 'env' | 'generateOAuthState' | 'generateOAuthCookieNames' | 'clean'>;
}): CreateOAuth => {
	const provider = 'github';

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
