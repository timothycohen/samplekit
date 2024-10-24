import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
	type VerifiedAuthenticationResponse,
	type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
	Auth,
	ServerAuthProvider,
	Config,
	DbAdapterProvider,
	TransformProvider,
} from '../../../../types/server/index.js';

// https://simplewebauthn.dev/docs/packages/server

const str64ToNumArr = (str: string): number[] => Buffer.from(str, 'base64url').toJSON().data;
const uint8ArrToStr64 = (uint8Array: Uint8Array): string => Buffer.from(uint8Array).toString('base64url');
const str64ToU8Arr = (str: string): Uint8Array => new Uint8Array(str64ToNumArr(str));

const getSavedDevices = (savedPasskeys: Auth.MFAs['passkeys']) =>
	savedPasskeys?.map((device) => ({
		id: device.credentialID,
		type: 'public-key' as const,
		transports: device.transports,
	})) ?? [];

export const createPasskey = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}): ServerAuthProvider<PWOP>['pass']['MFA']['passkey'] => {
	const getSaved: ServerAuthProvider<PWOP>['pass']['MFA']['passkey']['getSaved'] = async (userId: string) => {
		const provider = await dbProvider.getByUserId({ kind: 'pass', userId });
		if (!provider) return null;
		return transformProvider.toLib(provider).passkeys;
	};

	return {
		createRegOpts: async ({ savedPasskeys, email, givenName }) =>
			generateRegistrationOptions({
				rpName: config.passkey.rpName,
				rpID: config.passkey.rpID,
				userID: Buffer.from(email),
				userName: givenName,
				timeout: config.passkeyTimeout,
				attestationType: 'none',
				excludeCredentials: getSavedDevices(savedPasskeys),
			}),
		createAuthOpts: async ({ savedPasskeys }) =>
			generateAuthenticationOptions({
				rpID: config.passkey.rpID,
				timeout: config.passkeyTimeout,
				allowCredentials: getSavedDevices(savedPasskeys),
				userVerification: 'required',
			}),
		verifyClientReg: async ({ expectedChallenge, userId, clientRegResponse }) => {
			let verification: VerifiedRegistrationResponse;
			try {
				verification = await verifyRegistrationResponse({
					response: clientRegResponse,
					expectedChallenge,
					expectedOrigin: config.env.PUBLIC_ORIGIN,
					expectedRPID: config.passkey.rpID,
				});
			} catch {
				return { error: { status: 403, message: 'Verification failed.', code: 'registration_failed' } };
			}

			const { verified, registrationInfo } = verification;
			if (!verified) {
				return { error: { status: 403, message: 'Verification failed.', code: 'not_verified' } };
			}
			if (!registrationInfo) {
				return { error: { status: 403, message: 'Verification failed.', code: 'no_registration_info' } };
			}

			const { counter, id: credentialID, publicKey } = registrationInfo.credential;
			const credentialPublicKey = uint8ArrToStr64(publicKey);

			const savedPasskeys = await getSaved(userId);
			const existingPasskey = savedPasskeys?.some((passkey) => credentialID === passkey.credentialID);

			if (existingPasskey) {
				return { error: { status: 409, message: 'Passkey already registered.', code: 'preexisting_passkey' } };
			}

			const newPasskey = {
				credentialPublicKey,
				credentialID,
				counter,
				transports: clientRegResponse.response.transports,
			};

			const newPasskeys = savedPasskeys ? [...savedPasskeys, newPasskey] : [newPasskey];

			return { data: newPasskeys };
		},
		verifyClientAuth: async ({ expectedChallenge, userId, clientAuthResponse, savedPasskeys }) => {
			if (!savedPasskeys?.length) {
				return { error: { status: 403, message: 'Passkey not found.', code: 'no_saved_passkeys' } };
			}
			const savedPasskey = savedPasskeys.find((passkey) => passkey.credentialID === clientAuthResponse.id);
			if (!savedPasskey) {
				return { error: { status: 403, message: 'Passkey not found.', code: 'invalid_id' } };
			}

			let verification: VerifiedAuthenticationResponse;
			try {
				verification = await verifyAuthenticationResponse({
					response: clientAuthResponse,
					expectedChallenge,
					expectedOrigin: config.env.PUBLIC_ORIGIN,
					expectedRPID: config.passkey.rpID,
					requireUserVerification: true,
					credential: {
						counter: savedPasskey.counter,
						id: savedPasskey.credentialID,
						publicKey: str64ToU8Arr(savedPasskey.credentialPublicKey),
						transports: savedPasskey.transports,
					},
				});
			} catch {
				return { error: { status: 403, message: 'Verification failed.', code: 'authentication_failed' } };
			}

			const { verified, authenticationInfo } = verification;
			if (!verified) return { error: { status: 403, message: 'Verification failed.', code: 'not_verified' } };

			savedPasskey.counter = authenticationInfo.newCounter;
			savedPasskeys = savedPasskeys.map((d) => (savedPasskey.credentialID === d.credentialID ? savedPasskey : d));

			await dbProvider.updateByUserId({ kind: 'pass', userId, values: { passkeys: savedPasskeys } });

			return { data: { message: 'Success' } };
		},
		getSaved,
	};
};
