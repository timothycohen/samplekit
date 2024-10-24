import type { Result } from '../../../utils/common/index.js';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from '../../common.js';
import type { Auth, AuthenticatorDevice } from '../auth.js';
import type { Cookies } from '../cookie.js';

export type ServerAuthProviderCommon = {
	changeToPass: (arg: { userId: string; email: string; password: string; provider: 'email' }) => Promise<void>;
	changeToOAuth: ({ provider, userId }: { provider: string; userId: string }) => Promise<void>;
	getMethodOrThrow: (userId: string) => Promise<'oauth' | 'pass'>;
};

export type ServerAuthProviderOAuth = {
	createStatelessUrl: (clientArgs: { clientId: string; redirectPathname: string }) => URL;
	setState: (clientArgs: { url: URL; cookies: Cookies; persistent: boolean }) => void;
	serverCBUrlToOAuthData: (clientArgs: {
		url: URL;
		cookies: Pick<Cookies, 'get' | 'delete'>;
		redirectPathname: string;
		clientId: string;
		clientSecret: string;
	}) => Promise<
		| {
				success: true;
				data: { clean_email: string; given_name: string; family_name: string; picture: string | null };
				wantsPersistentSession: boolean;
		  }
		| { success: false; error: 'csrf' | 'missing_params' | 'invalid_state' | 'invalid_token' | 'invalid_data_format' }
	>;
};

export type ServerAuthProviderMfaCommon = {
	enable: (
		args: { userId: string } & (
			| { passkeys: NonNullable<Auth.MFAs['passkeys']>; sms?: never; authenticator?: never }
			| { passkeys?: never; sms: NonNullable<Auth.MFAs['sms']>; authenticator?: never }
			| { passkeys?: never; sms?: never; authenticator: NonNullable<Auth.MFAs['authenticator']> }
		),
	) => Promise<void>;
	disable: (args: { userId: string; type: Auth.MFAs.Kind }) => Promise<void>;
	isRequired: (userId: string) => Promise<boolean>;
	calcMFAsEnabled: (mfas?: Auth.MFAs) => Auth.MFAs.Enabled;
	countMFAs: (mfasEnabled: Auth.MFAs.Enabled) => number;
};

export type ServerAuthProviderPassMfa = ServerAuthProviderMfaCommon & {
	authenticator: {
		generateClientSetupDetails: ({ email, secret }: { email: string; secret: string }) => Promise<{
			key: string;
			dataUrl: string | null;
		}>;
	};
	passkey: {
		createRegOpts: (a: {
			savedPasskeys: Auth.MFAs['passkeys'];
			email: string;
			givenName: string;
		}) => Promise<PublicKeyCredentialCreationOptionsJSON>;
		createAuthOpts: (a: { savedPasskeys: Auth.MFAs['passkeys'] }) => Promise<PublicKeyCredentialRequestOptionsJSON>;
		verifyClientReg: (a: {
			expectedChallenge: string;
			userId: string;
			clientRegResponse: RegistrationResponseJSON;
		}) => Promise<Result<NonNullable<Auth.MFAs['passkeys']>>>;
		verifyClientAuth: (a: {
			expectedChallenge: string;
			userId: string;
			clientAuthResponse: AuthenticationResponseJSON;
			savedPasskeys: Auth.MFAs['passkeys'];
		}) => Promise<Result<Result.Success>>;
		getSaved: (userId: string) => Promise<AuthenticatorDevice[] | null>;
	};
	getDetailsOrThrow: (userId: string) => Promise<{
		method: 'oauth' | 'pass';
		mfas: {
			authenticator: string | null;
			passkeys: AuthenticatorDevice[] | null;
			sms: string | null;
		};
		mfasEnabled: Auth.MFAs.Enabled;
		mfaCount: number;
		emailVerified: boolean;
	}>;
};

export type ServerAuthProviderPassEmail<PWOP> = {
	updatePass: (arg: { email: string; newPassword: string }) => Promise<void>;
	verifyEmail: (arg: { userId: string }) => Promise<void>;
	get: (arg: { email: string; pass: string }) => Promise<PWOP | null>;
};

export type ServerAuthProvider<PWOP> = ServerAuthProviderCommon & {
	oauth: {
		google: ServerAuthProviderOAuth;
		github: ServerAuthProviderOAuth;
	};
	pass: {
		MFA: ServerAuthProviderPassMfa;
		email: ServerAuthProviderPassEmail<PWOP>;
	};
};
