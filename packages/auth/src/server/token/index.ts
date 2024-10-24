import { tokenKinds } from './consts.js';
import { createGetOrCreate } from './getOrCreate.js';
import { createValidate } from './validate.js';
import type {
	ServerAuthToken,
	Config,
	DbAdapterProvider,
	DbAdapterToken,
	TransformProvider,
} from '../../types/server/index.js';

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
}): ServerAuthToken => {
	const c = createGetOrCreate({ config, dbToken });

	const v = createValidate({ config, dbToken });

	return {
		emailVeri: {
			createOrRefresh: c.getOrCreateEmailVeri,
			validate: v.validateEmailVeri,
		},
		passkeyChallenge: {
			createOrReplace: c.createOrReplacePasskeyChallengeToken,
			getChallenge: v.getValidPasskeyChallenge,
			delete: (a) => dbToken.deleteByUserId({ tokenKind: 'passkey_challenge', ...a }),
		},
		pwReset: {
			createOrRefresh: c.getOrCreatePwReset,
			validate: v.validatePwReset,
		},
		setupSMSVeri: {
			createOrUpdate: c.getCreateOrReplaceSetupSMSVeri,
			validate: v.validateSetupSmsVeri,
		},
		smsVeri: {
			createOrRefresh: c.getOrCreateSmsVeri,
			validate: v.validateSmsVeri,
		},
		setupAuthenticator: {
			createOrRefresh: c.getOrCreateSetupAuthenticator,
			validate: v.validateSetupAuthenticator,
		},
		authenticator: {
			isValid: async ({ token, userId }) => {
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
