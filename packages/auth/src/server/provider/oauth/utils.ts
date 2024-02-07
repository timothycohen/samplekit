import type { Cookies } from '../../types/index.js';

export type CreateOAuthStatelessUrl = (configArgs: {
	PUBLIC_ORIGIN: string;
}) => (clientArgs: { clientId: string; redirectPathname: string }) => URL;

export type CreateSetOAuthState = (configArgs: {
	generateOAuthState: () => string;
	cookieNames: { state: string; isPersistentSession: string };
	secureCookie: boolean;
}) => (clientArgs: { url: URL; cookies: Cookies; persistent: boolean }) => void;

export type CreateFetchOAuthAccessToken = (configArgs: {
	PUBLIC_ORIGIN: string;
}) => (clientArgs: {
	authorizationCode: string;
	redirectPathname: string;
	clientId: string;
	clientSecret: string;
}) => Promise<{ success: true; accessToken: string } | { success: false; error: string }>;

export type CreateFetchOAuthUserData = (configArgs: {
	cleanEmail: (email: string) => string;
}) => (clientArgs: {
	accessToken: string;
}) => Promise<{ clean_email: string; given_name: string; family_name: string; picture: string } | null>;

export type CreateOAuth = {
	createStatelessUrl: ReturnType<CreateOAuthStatelessUrl>;
	setState: ReturnType<CreateSetOAuthState>;
	serverCBUrlToOAuthData: ReturnType<CreateServerCBUrlToOAuthCbData>;
};

export type ReadUrl = (url: URL) => { state: string | null; code: string | null };

type OAuthCbData = { clean_email: string; given_name: string; family_name: string; picture: string | null };

type SetOAuthCookies = (configArgs: {
	cookieNames: { state: string; isPersistentSession: string };
	secureCookie: boolean;
}) => (clientArgs: { cookies: Pick<Cookies, 'set'>; state: string; persistent: boolean }) => void;

export const setOAuthCookies: SetOAuthCookies =
	({ cookieNames, secureCookie }) =>
	({ cookies, state, persistent }) => {
		cookies.set(cookieNames.state, state, { httpOnly: true, secure: secureCookie, path: '/', maxAge: 86400 });
		if (persistent) {
			cookies.set(cookieNames.isPersistentSession, 'true', {
				httpOnly: true,
				secure: secureCookie,
				path: '/',
				maxAge: 86400,
			});
		}
	};

const readOAuthCookies = ({
	cookieNames,
	cookies,
}: {
	cookieNames: { state: string; isPersistentSession: string };
	cookies: Pick<Cookies, 'get'>;
}) => ({
	storedState: cookies.get(cookieNames.state),
	wantsPersistentSession: !!cookies.get(cookieNames.isPersistentSession),
});

const deleteOAuthCookies = ({
	cookieNames,
	secureCookie,
	cookies,
}: {
	cookieNames: { state: string; isPersistentSession: string };
	secureCookie: boolean;
	cookies: Pick<Cookies, 'delete'>;
}) => {
	cookies.delete(cookieNames.state, { httpOnly: true, secure: secureCookie, path: '/', maxAge: 86400 });
	cookies.delete(cookieNames.isPersistentSession, { httpOnly: true, secure: secureCookie, path: '/', maxAge: 86400 });
};

type CreateServerCBUrlToOAuthCbData = (configArgs: {
	cookieNames: { state: string; isPersistentSession: string };
	secureCookie: boolean;
	fetchAccessToken: (a: {
		authorizationCode: string;
		redirectPathname: string;
		clientId: string;
		clientSecret: string;
	}) => Promise<{ success: true; accessToken: string } | { success: false; error: string }>;
	fetchUser: ({ accessToken }: { accessToken: string }) => Promise<OAuthCbData | null>;
	readUrl: (url: URL) => { state: string | null; code: string | null };
}) => (clientArgs: {
	url: URL;
	cookies: Pick<Cookies, 'get' | 'delete'>;
	redirectPathname: string;
	clientId: string;
	clientSecret: string;
}) => Promise<
	| { success: true; data: OAuthCbData; wantsPersistentSession: boolean }
	| { success: false; error: 'csrf' | 'missing_params' | 'invalid_state' | 'invalid_token' | 'invalid_data_format' }
>;

export const createServerCBUrlToOAuthCbData: CreateServerCBUrlToOAuthCbData =
	({ cookieNames, secureCookie, fetchAccessToken, fetchUser, readUrl }) =>
	async ({ url, cookies, redirectPathname, clientId, clientSecret }) => {
		const { storedState, wantsPersistentSession } = readOAuthCookies({ cookies, cookieNames });
		const { state, code } = readUrl(url);

		if (!storedState) return { success: false, error: 'csrf' };
		if (!state || !code) return { success: false, error: 'missing_params' };
		if (storedState !== state) return { success: false, error: 'invalid_state' };

		const token = await fetchAccessToken({ authorizationCode: code, redirectPathname, clientId, clientSecret });
		if (!token.success) return { success: false, error: 'invalid_token' };
		const userData = await fetchUser({ accessToken: token.accessToken });
		if (!userData) return { success: false, error: 'invalid_data_format' };

		deleteOAuthCookies({ cookieNames, secureCookie, cookies });

		return { success: true, data: userData, wantsPersistentSession };
	};
