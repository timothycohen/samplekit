import type {
	Config,
	DbAdapterProvider,
	ServerAuthProviderPassEmail,
	TransformProvider,
} from '../../../types/server/index.js';

export const createEmail = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Pick<Config, 'passwordHash' | 'clean'>;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}): ServerAuthProviderPassEmail<PWOP> => {
	return {
		updatePass: async ({ newPassword, email }) =>
			dbProvider.updateByEmail({
				email: config.clean.email(email),
				sourceKind: 'pass',
				values: { hashedPassword: await config.passwordHash.generate(newPassword) },
			}),
		verifyEmail: async ({ userId }) =>
			await dbProvider.updateByUserId({ userId, kind: 'pass', values: { emailVerified: true } }),
		get: async ({ email, pass }) => {
			const cleaned = config.clean.email(email);
			const provider = await dbProvider.getByEmail({ email: cleaned, kind: 'pass' });
			if (!provider) return null;
			const libProvider = transformProvider.toLib(provider);
			if (!libProvider.hashedPassword) return null;
			if (!(await config.passwordHash.validate(pass, libProvider.hashedPassword))) return null;

			return dbProvider.removeHashedPassword(provider);
		},
	};
};
