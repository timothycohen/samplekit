import { createCommon } from './common.js';
import { createPasskey } from './passkey.js';
import type {
	ServerAuthProvider,
	Config,
	DbAdapterProvider,
	TransformProvider,
} from '../../../../types/server/index.js';

export const createMFA = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}): ServerAuthProvider<PWOP>['pass']['MFA'] => {
	const common = createCommon({ dbProvider, transformProvider });

	return {
		authenticator: {
			generateClientSetupDetails: async ({ email, secret }) => {
				const setupOtpUri = config.authenticator.keyuri({ email, secret });
				const key = setupOtpUri.split('=')[1]!.split('&')[0]!;
				const dataUrl = await config.authenticator.createDataUrl({ setupOtpUri });
				return { key, dataUrl };
			},
		},
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
