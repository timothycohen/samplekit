import { createGetOrCreate } from './getOrCreate.js';
import { createValidate } from './validate.js';
import { tokenKinds } from './vars.js';
import type { Config, DbAdapterProvider, DbAdapterToken, TransformProvider } from '../types/index.js';

export const createAuthToken = <P, PWOP, CtxP>({
	dbProvider,
	transformProvider,
	dbToken,
	config,
}: {
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, CtxP>;
	dbToken: DbAdapterToken;
	config: Config;
}) => {
	const { createOrReplacePasskeyChallengeToken, getCreateOrReplaceSetupSMSVeri, getOrCreateToken } = createGetOrCreate({
		config,
		dbToken,
	});

	const { getValidUnlimSendUnlimAttempt, validateLimAttemptToken, validateLimSendUnlimAttempt } = createValidate({
		config,
		dbToken,
	});

	return {
		emailVeri: {
			createOrRefresh: (a: { userId: string }) => getOrCreateToken({ tokenKind: 'email_veri', ...a }),
			validate: (a: { token: string; checkOnly?: true }) =>
				validateLimSendUnlimAttempt({ tokenKind: 'email_veri', ...a }),
		},
		passkeyChallenge: {
			createOrReplace: createOrReplacePasskeyChallengeToken,
			getChallenge: async (a: { userId: string }) => {
				const res = await getValidUnlimSendUnlimAttempt({ tokenKind: 'passkey_challenge', checkOnly: true, ...a });
				return res.tokenErr ? { tokenErr: res.tokenErr } : { challenge: res.storedToken.token };
			},
			delete: (a: { userId: string }) => dbToken.deleteByUserId({ tokenKind: 'passkey_challenge', ...a }),
		},
		pwReset: {
			createOrRefresh: (a: { userId: string }) => getOrCreateToken({ tokenKind: 'pw_reset', ...a }),
			validate: (a: { token: string; checkOnly?: true }) =>
				validateLimSendUnlimAttempt({ tokenKind: 'pw_reset', ...a }),
		},
		setupSMSVeri: {
			createOrUpdate: getCreateOrReplaceSetupSMSVeri,
			validate: async (a: { token: string; userId: string; checkOnly?: true }) => {
				const res = await validateLimAttemptToken({ tokenKind: 'setup_sms_veri', ...a });
				return res.tokenErr ? { tokenErr: res.tokenErr } : { phoneNumber: res.validated.phoneNumber };
			},
		},
		smsVeri: {
			createOrRefresh: async (a: { userId: string }) => {
				const res = await getOrCreateToken({ tokenKind: 'sms_veri', ...a });
				return res.tokenErr ? { tokenErr: res.tokenErr } : { otp: res.token };
			},
			validate: async (a: { token: string; userId: string; checkOnly?: true }) => {
				const res = await validateLimAttemptToken({ tokenKind: 'sms_veri', ...a });
				return res.tokenErr ? { tokenErr: res.tokenErr } : {};
			},
		},
		setupAuthenticator: {
			createOrRefresh: async (a: { userId: string }) => {
				return { secret: (await getOrCreateToken({ tokenKind: 'setup_authenticator', ...a })).token };
			},
			validate: async (a: { token: string; userId: string; checkOnly?: true }) => {
				const res = await validateLimAttemptToken({ tokenKind: 'setup_authenticator', ...a });
				return res.tokenErr ? { tokenErr: res.tokenErr } : { secret: res.validated.token };
			},
		},
		authenticator: {
			isValid: async ({ token, userId }: { token: string; userId: string }) => {
				const provider = await dbProvider.getByUserId({ kind: 'pass', userId });
				if (!provider) return { valid: false };
				const secret = transformProvider.toLib(provider).authenticator;
				return secret ? { valid: token === config.authenticator.generateToken({ secret }) } : { valid: false };
			},
		},
		deleteAllExpired: async () =>
			Promise.all(
				tokenKinds.map((token) => dbToken.deleteExpired({ tokenKind: token }).then((res) => [token, res] as const)),
			),
	};
};
