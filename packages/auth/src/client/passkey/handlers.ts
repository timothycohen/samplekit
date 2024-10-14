import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type { ClientAuth } from '../../types/client.js';

export const passkey: ClientAuth['passkey'] = {
	startReg: async (optionsJSON) => {
		try {
			return { data: await startRegistration(optionsJSON) };
		} catch (err) {
			if (err instanceof Error) {
				return { error: err } as { error: Error };
			} else {
				return { error: new Error('Not supported.') } as { error: Error };
			}
		}
	},
	startAuth: async (optionsJSON) => {
		try {
			return { data: await startAuthentication(optionsJSON) };
		} catch (err) {
			if (err instanceof Error) {
				return { error: err } as { error: Error };
			} else {
				return { error: new Error('Not supported.') } as { error: Error };
			}
		}
	},
};
