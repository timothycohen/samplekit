import type { Auth } from '../auth.js';

export type ServerAuthUser<U, P, UCtx, PCtx> = {
	get: (args: { userId: string; email?: never } | { userId?: never; email: string }) => Promise<U | undefined | null>;
	createEmailPass: (
		args: { email: string; givenName: string; familyName: string; rawPassword: string },
		passToTransformUser: UCtx,
		passToTransformProvider: PCtx,
	) => Promise<{ user: U; error?: never } | { user?: never; error: 'email_taken' }>;
	getOrCreateOAuth: (
		args: { clean_email: string; given_name: string; family_name: string; picture: string | null },
		oauthProvider: Auth.Provider.OAuth['provider'],
		passToTransformUser: UCtx,
		passToTransformProvider: PCtx,
	) => Promise<{ user: U; provider: P; error?: never } | { user?: never; provider?: never; error: 'email_taken' }>;
	delete: (args: { userId: string }) => Promise<void>;
};
