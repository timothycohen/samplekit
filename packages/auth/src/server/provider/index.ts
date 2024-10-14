import { createGithub } from './oauth/github.js';
import { createGoogle } from './oauth/google.js';
import { createEmail } from './pass/email.js';
import { createMFA } from './pass/mfa/index.js';
import type { Config, DbAdapterProvider, TransformProvider, ServerAuthProvider } from '../../types/server/index.js';

export const createAuthProvider = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}): ServerAuthProvider<PWOP> => {
	return {
		changeToPass: async (arg) =>
			dbProvider.updateByUserId({
				userId: arg.userId,
				kind: 'oauth',
				values: {
					hashedPassword: await config.passwordHash.generate(arg.password),
					kind: 'pass',
					provider: arg.provider,
				},
			}),
		changeToOAuth: async ({ provider, userId }) =>
			dbProvider.updateByUserId({
				userId,
				kind: 'pass',
				values: {
					hashedPassword: null,
					kind: 'oauth',
					provider,
					emailVerified: true,
				},
			}),
		/** @throws Throws an `Error` if authProviders.userId does not exist */
		getMethodOrThrow: async (userId) => {
			const authProvider = await dbProvider.getByUserId({ kind: 'any', userId });
			if (!authProvider) throw new Error('User has no auth provider');
			return transformProvider.toLib(authProvider).kind;
		},
		pass: {
			email: createEmail({ config, dbProvider, transformProvider }),
			MFA: createMFA({ config, dbProvider, transformProvider }),
		},
		oauth: {
			google: createGoogle({ config }),
			github: createGithub({ config }),
		},
	};
};
