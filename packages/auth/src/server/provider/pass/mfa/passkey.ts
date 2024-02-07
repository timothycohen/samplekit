import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
	type VerifiedAuthenticationResponse,
	type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type { Result } from '../../../../utils/common/index.js';
import type { Auth, Config, DbAdapterProvider, TransformProvider } from '../../../types/index.js';
import type { startAuthentication, startRegistration } from '@simplewebauthn/browser';

// https://simplewebauthn.dev/docs/packages/server

const str64ToNumArr = (str: string): number[] => Buffer.from(str, 'base64url').toJSON().data;
const uint8ArrToStr64 = (uint8Array: Uint8Array): string => Buffer.from(uint8Array).toString('base64url');
const str64ToU8Arr = (str: string): Uint8Array => new Uint8Array(str64ToNumArr(str));

export const createPasskey = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	const getSavedDevices = (savedPasskeys: Auth.MFAs['passkeys']) =>
		savedPasskeys?.map((device) => ({
			id: str64ToU8Arr(device.credentialID),
			type: 'public-key' as const,
			transport: device.transport,
		})) ?? [];

	const intoAuthenticator = (savedPasskey: NonNullable<Auth.MFAs['passkeys']>[number]) => ({
		...savedPasskey,
		credentialID: str64ToU8Arr(savedPasskey.credentialID),
		credentialPublicKey: str64ToU8Arr(savedPasskey.credentialPublicKey),
	});

	const createRegOpts = async ({
		savedPasskeys,
		email,
		givenName,
	}: {
		savedPasskeys: Auth.MFAs['passkeys'];
		email: string;
		givenName: string;
	}) =>
		generateRegistrationOptions({
			rpName: config.passkey.rpName,
			rpID: config.passkey.rpID,
			userID: email,
			userName: givenName,
			timeout: config.passkeyTimeout,
			attestationType: 'none',
			excludeCredentials: getSavedDevices(savedPasskeys),
		});

	const createAuthOpts = async ({ savedPasskeys }: { savedPasskeys: Auth.MFAs['passkeys'] }) =>
		generateAuthenticationOptions({
			rpID: config.passkey.rpID,
			timeout: config.passkeyTimeout,
			allowCredentials: getSavedDevices(savedPasskeys),
			userVerification: 'required',
		});

	const verifyClientReg = async ({
		expectedChallenge,
		userId,
		clientRegResponse,
	}: {
		expectedChallenge: string;
		userId: string;
		clientRegResponse: Awaited<ReturnType<typeof startRegistration>>;
	}): Promise<Result<NonNullable<Auth.MFAs['passkeys']>>> => {
		let verification: VerifiedRegistrationResponse;
		try {
			verification = await verifyRegistrationResponse({
				response: clientRegResponse,
				expectedChallenge,
				expectedOrigin: config.env.PUBLIC_ORIGIN,
				expectedRPID: config.passkey.rpID,
			});
		} catch (error) {
			return { error: { status: 403, message: 'Verification failed.', code: 'registration_failed' } };
		}

		const { verified, registrationInfo } = verification;
		if (!verified) {
			return { error: { status: 403, message: 'Verification failed.', code: 'not_verified' } };
		}
		if (!registrationInfo) {
			return { error: { status: 403, message: 'Verification failed.', code: 'no_registration_info' } };
		}

		const { counter } = registrationInfo;
		const credentialID = uint8ArrToStr64(registrationInfo.credentialID);
		const credentialPublicKey = uint8ArrToStr64(registrationInfo.credentialPublicKey);

		const savedPasskeys = await getSaved(userId);
		const existingPasskey = savedPasskeys?.some((passkey) => credentialID === passkey.credentialID);

		if (existingPasskey) {
			return { error: { status: 409, message: 'Passkey already registered.', code: 'preexisting_passkey' } };
		}

		const newPasskey = {
			credentialPublicKey,
			credentialID,
			counter,
			transport: clientRegResponse.response.transports,
		};

		const newPasskeys = savedPasskeys ? [...savedPasskeys, newPasskey] : [newPasskey];

		return { data: newPasskeys };
	};

	const verifyClientAuth = async ({
		expectedChallenge,
		userId,
		clientAuthResponse,
		savedPasskeys,
	}: {
		expectedChallenge: string;
		userId: string;
		clientAuthResponse: Awaited<ReturnType<typeof startAuthentication>>;
		savedPasskeys: Auth.MFAs['passkeys'];
	}): Promise<Result<Result.Success>> => {
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
				authenticator: intoAuthenticator(savedPasskey),
			});
		} catch (error) {
			return { error: { status: 403, message: 'Verification failed.', code: 'authentication_failed' } };
		}

		const { verified, authenticationInfo } = verification;
		if (!verified) return { error: { status: 403, message: 'Verification failed.', code: 'not_verified' } };

		savedPasskey.counter = authenticationInfo.newCounter;
		savedPasskeys = savedPasskeys.map((d) => (savedPasskey.credentialID === d.credentialID ? savedPasskey : d));

		await dbProvider.updateByUserId({ kind: 'pass', userId, values: { passkeys: savedPasskeys } });

		return { data: { message: 'Success' } };
	};

	const getSaved = async (userId: string) => {
		const provider = await dbProvider.getByUserId({ kind: 'pass', userId });
		if (!provider) return null;
		return transformProvider.toLib(provider).passkeys;
	};

	return {
		createRegOpts,
		createAuthOpts,
		verifyClientReg,
		verifyClientAuth,
		getSaved,
	};
};
