import type { Auth } from '../types/index.js';

export interface DefaultConfig {
	authenticator: {
		generateSecret: () => string;
		generateToken: ({ secret }: { secret: string }) => string;
		keyuri: ({ email, secret }: { email: string; secret: string }) => string;
		createDataUrl: (args: { setupOtpUri: string }) => Promise<string | null>;
	};
	clean: {
		email: (email: string) => string;
	};
	randomString: {
		alphabet: Record<string, string> & { default: string };
		generate: ({ alphabet, size }: { size: number; alphabet: string | 'default' }) => string;
	};
	generateId: () => string;
	generateOAuthState: () => string;
	generateOAuthCookieNames: (providerName: Auth.Provider.OAuth.Supported) => {
		state: string;
		isPersistentSession: string;
	};
	passkeyTimeout: number;
	passwordHash: {
		generate: (s: string) => Promise<string>;
		validate: (s: string, hash: string) => Promise<boolean>;
	};
	tokenMaxVeriAttempts: number;
	tokenExpiryTimes: Record<Auth.Token.Kind.All, number>;
	tokenLimSend: Record<
		Auth.Token.Kind.LimSend,
		{
			size: number;
			alphabet: string | 'default';
			maxSend: number;
			timeoutMs: Record<number, number> & { max: number };
		}
	>;
}

/**
 *
 * ### Default packages:
 *
 * authenticator: **otplib** and **qrcode**
 *
 * passwordHash: **crypto.scrypt**
 *
 * randomString.generate, generateId, and generateOAuthState: **nanoid**
 *
 * handling passkeys: **@simplewebauthn/browser** & **@simplewebauthn/server** (*not overridable*)
 */
export interface RequiredConfig extends Partial<DefaultConfig> {
	env: {
		secureCookie: boolean;
		PUBLIC_ORIGIN: string;
	};
	lastSeen: { updateEvery: number };
	sessionExpiresIn: {
		activePeriod: number;
		idlePeriod: number;
	};
	passkey: {
		rpName: string;
		rpID: string;
	};
	authenticatorName: string;
}
export type Config = RequiredConfig & DefaultConfig;
