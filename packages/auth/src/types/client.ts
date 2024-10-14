import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from './common.js';

type StartPasskeyReg = (
	optionsJSON: PublicKeyCredentialCreationOptionsJSON,
) => Promise<{ data: RegistrationResponseJSON; error?: never } | { data?: never; error: Error }>;

type StartPasskeyAuth = (
	optionsJSON: PublicKeyCredentialRequestOptionsJSON,
) => Promise<{ data: AuthenticationResponseJSON; error?: never } | { data?: never; error: Error }>;

export interface ClientAuth {
	passkey: {
		startReg: StartPasskeyReg;
		startAuth: StartPasskeyAuth;
	};
}
