import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';

export const startPasskeyReg = async (
	opts: Parameters<typeof startRegistration>[0],
): Promise<{ data: RegistrationResponseJSON; error?: never } | { data?: never; error: Error }> => {
	try {
		return { data: await startRegistration(opts) };
	} catch (err) {
		if (err instanceof Error) {
			return { error: err } as { error: Error };
		} else {
			return { error: new Error('Not supported.') } as { error: Error };
		}
	}
};

export const startPasskeyAuth = async (
	opts: Parameters<typeof startAuthentication>[0],
): Promise<{ data: AuthenticationResponseJSON; error?: never } | { data?: never; error: Error }> => {
	try {
		return { data: await startAuthentication(opts) };
	} catch (err) {
		if (err instanceof Error) {
			return { error: err } as { error: Error };
		} else {
			return { error: new Error('Not supported.') } as { error: Error };
		}
	}
};
