type Base64Url = string;
export type AuthenticatorDevice = {
	credentialPublicKey: Base64Url;
	credentialID: Base64Url;
	counter: number;
	transport?: string[]; // import('@simplewebauthn/types').AuthenticatorTransportFuture[];
};

export declare namespace Auth {
	type User = {
		id: string;
		email: string;
		givenName: string;
		familyName: string;
		joinedOn: Date;
		avatar: string | null;
	};

	type Session = {
		id: string;
		userId: string;
		idleExpires: Date;
		activeExpires: Date;
		awaitingMFA: boolean;
		awaitingEmailVeri: boolean;
		login: Date;
		lastSeen: Date;
		temporaryConfirmationExpires: Date;
		persistent: boolean;
	};

	type Provider = Provider.OAuth | Provider.Pass;
	namespace Provider {
		type OAuth = {
			kind: 'oauth';
			provider: string; // example: 'google' | 'github'
			email: string;
			userId: string;
			emailVerified: true;
			hashedPassword: null;
			authenticator: null;
			passkeys: null;
			sms: null;
		};

		namespace OAuth {
			type Supported = 'google' | 'github';
		}

		type Pass = {
			kind: 'pass';
			userId: string;
			emailVerified: boolean;
			hashedPassword: string;
			authenticator: string | null; // secret
			passkeys: AuthenticatorDevice[] | null; // user devices
			sms: string | null; // sanitized phone number
		} & { provider: 'email'; email: string };
		// | { provider: 'username'; email: string | null; username: string }
	}

	type MFAs = { authenticator: string | null; passkeys: AuthenticatorDevice[] | null; sms: string | null };
	namespace MFAs {
		type Enabled = { authenticator: boolean; passkeys: boolean; sms: boolean };
		type Kind = keyof Enabled;
	}

	namespace Token {
		type _Base = { token: string; userId: string; expires: Date };
		type _LimSend = { sendCount: number; sendTime: Date };
		type _LimAttempt = { veriAttemptCount: number; veriAttemptTime: Date | null };

		type UnlimSendUnlimAttempt = _Base & { kind: 'passkey_challenge' };
		type UnlimSendLimAttempt = _Base & _LimAttempt & { kind: 'setup_authenticator' };
		type LimSendUnlimAttempt = _Base & _LimSend & { kind: 'email_veri' | 'pw_reset' };
		type SMSVeri = _Base & _LimSend & _LimAttempt & { kind: 'sms_veri'; phoneNumber?: never };
		type SetupSMSVeri = _Base & _LimSend & _LimAttempt & { kind: 'setup_sms_veri'; phoneNumber: string };
		type LimSendLimAttempt = SMSVeri | SetupSMSVeri;

		type All = UnlimSendUnlimAttempt | UnlimSendLimAttempt | LimSendUnlimAttempt | LimSendLimAttempt;
		type UnlimSend = UnlimSendUnlimAttempt | UnlimSendLimAttempt;
		type LimSend = LimSendUnlimAttempt | LimSendLimAttempt;
		type UnlimAttempt = UnlimSendUnlimAttempt | LimSendUnlimAttempt;
		type LimAttempt = UnlimSendLimAttempt | LimSendLimAttempt;

		namespace Kind {
			type UnlimSendUnlimAttempt = Pick<Auth.Token.UnlimSendUnlimAttempt, 'kind'>['kind'];
			type UnlimSendLimAttempt = Pick<Auth.Token.UnlimSendLimAttempt, 'kind'>['kind'];
			type LimSendUnlimAttempt = Pick<Auth.Token.LimSendUnlimAttempt, 'kind'>['kind'];
			type LimSendLimAttempt = Pick<Auth.Token.LimSendLimAttempt, 'kind'>['kind'];

			type All = UnlimSendUnlimAttempt | UnlimSendLimAttempt | LimSendUnlimAttempt | LimSendLimAttempt;
			type UnlimSend = UnlimSendUnlimAttempt | UnlimSendLimAttempt;
			type LimSend = LimSendUnlimAttempt | LimSendLimAttempt;
			type UnlimAttempt = UnlimSendUnlimAttempt | LimSendUnlimAttempt;
			type LimAttempt = UnlimSendLimAttempt | LimSendLimAttempt;
		}
	}
}
