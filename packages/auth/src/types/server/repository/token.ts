import type { TokenErr } from '../errors.js';

type GetOrCreateLimSend = (a: {
	userId: string;
}) => Promise<{ token: string; tokenErr?: never } | { token?: never; tokenErr: TokenErr.LimSend }>;

type ValidateLimSendUnlimAttempt = (a: {
	token: string;
	checkOnly?: true;
}) => Promise<{ userId?: never; tokenErr: TokenErr.Val } | { userId: string; tokenErr?: never }>;

export type ServerAuthToken = {
	emailVeri: {
		createOrRefresh: GetOrCreateLimSend;
		validate: ValidateLimSendUnlimAttempt;
	};
	passkeyChallenge: {
		createOrReplace: (a: { userId: string; challenge: string }) => Promise<void>;
		getChallenge: (a: {
			userId: string;
			checkOnly?: true;
		}) => Promise<{ challenge?: never; tokenErr: TokenErr.All } | { challenge: string; tokenErr?: never }>;
		delete: (a: { userId: string }) => Promise<void>;
	};
	pwReset: {
		createOrRefresh: GetOrCreateLimSend;
		validate: ValidateLimSendUnlimAttempt;
	};
	setupSMSVeri: {
		createOrUpdate: (a: {
			userId: string;
			phoneNumber: string;
		}) => Promise<{ otp: string; tokenErr?: never } | { otp?: never; tokenErr: TokenErr.LimSend }>;
		validate: (a: {
			token: string;
			checkOnly?: true;
			userId: string;
		}) => Promise<{ phoneNumber: string; tokenErr?: never } | { phoneNumber?: never; tokenErr: TokenErr.All }>;
	};
	smsVeri: {
		createOrRefresh: (a: {
			userId: string;
		}) => Promise<{ otp: string; tokenErr?: never } | { otp?: never; tokenErr: TokenErr.LimSend }>;
		validate: (a: { token: string; checkOnly?: true; userId: string }) => Promise<{ tokenErr?: TokenErr.All }>;
	};
	setupAuthenticator: {
		createOrRefresh: (a: { userId: string }) => Promise<{ secret: string }>;
		validate: (a: {
			token: string;
			checkOnly?: true;
			userId: string;
		}) => Promise<{ secret: string; tokenErr?: never } | { secret?: never; tokenErr: TokenErr.All }>;
	};
	authenticator: {
		isValid: ({ token, userId }: { token: string; userId: string }) => Promise<{ valid: boolean }>;
	};
	deleteAllExpired: () => Promise<
		(readonly [
			'passkey_challenge' | 'setup_authenticator' | 'email_veri' | 'pw_reset' | 'sms_veri' | 'setup_sms_veri',
			number,
		])[]
	>;
};
