import { createAuthenticator } from './authenticator.js';
import { createCommon } from './common.js';
import { createPasskey } from './passkey.js';
import type { Config, DbAdapterProvider, TransformProvider } from '../../../types/index.js';

export const createMFA = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	const common = createCommon({ dbProvider, transformProvider });

	return {
		authenticator: createAuthenticator({ config }),
		...common,
		passkey: createPasskey({ config, dbProvider, transformProvider }),

		/** @throws Throws an `Error` if authProviders.userId does not exist */
		getDetailsOrThrow: async (userId: string) => {
			const authProvider = await dbProvider.getByUserId({ kind: 'any', userId });
			if (!authProvider) throw new Error('User has no auth provider');
			const libProvider = transformProvider.toLib(authProvider);

			const { kind: method, emailVerified } = libProvider;

			const mfas = { authenticator: libProvider.authenticator, passkeys: libProvider.passkeys, sms: libProvider.sms };
			const mfasEnabled = common.calcMFAsEnabled(mfas);
			const mfaCount = common.countMFAs(mfasEnabled);

			return { method, mfas, mfasEnabled, mfaCount, emailVerified };
		},
	};
};
