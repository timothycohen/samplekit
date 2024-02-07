import type { Config, DbAdapterProvider, TransformProvider } from '../types/index.js';

export const createCommon = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	const changeToPass = async (arg: { userId: string; email: string; password: string; provider: 'email' }) =>
		dbProvider.updateByUserId({
			userId: arg.userId,
			kind: 'oauth',
			values: {
				hashedPassword: await config.passwordHash.generate(arg.password),
				kind: 'pass',
				provider: arg.provider,
			},
		});

	const changeToOAuth = async ({ provider, userId }: { provider: string; userId: string }) =>
		dbProvider.updateByUserId({
			userId,
			kind: 'pass',
			values: {
				hashedPassword: null,
				kind: 'oauth',
				provider,
				emailVerified: true,
			},
		});

	/** @throws Throws an `Error` if authProviders.userId does not exist */
	const getMethodOrThrow = async (userId: string) => {
		const authProvider = await dbProvider.getByUserId({ kind: 'any', userId });
		if (!authProvider) throw new Error('User has no auth provider');
		return transformProvider.toLib(authProvider).kind;
	};

	return {
		changeToPass,
		changeToOAuth,
		getMethodOrThrow,
	};
};
