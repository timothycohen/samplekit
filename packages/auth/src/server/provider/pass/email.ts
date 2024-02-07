import type { Config, DbAdapterProvider, TransformProvider } from '../../types/index.js';

export const createEmail = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Pick<Config, 'passwordHash' | 'clean'>;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	const updatePass = async ({ newPassword, email }: { email: string; newPassword: string }): Promise<void> =>
		dbProvider.updateByEmail({
			email: config.clean.email(email),
			sourceKind: 'pass',
			values: { hashedPassword: await config.passwordHash.generate(newPassword) },
		});

	const verifyEmail = async ({ userId }: { userId: string }): Promise<void> =>
		await dbProvider.updateByUserId({ userId, kind: 'pass', values: { emailVerified: true } });

	const get = async ({ email, pass }: { email: string; pass: string }): Promise<PWOP | null> => {
		const cleaned = config.clean.email(email);
		const provider = await dbProvider.getByEmail({ email: cleaned, kind: 'pass' });
		if (!provider) return null;
		const libProvider = transformProvider.toLib(provider);
		if (!libProvider.hashedPassword) return null;
		if (!(await config.passwordHash.validate(pass, libProvider.hashedPassword))) return null;

		return dbProvider.removeHashedPassword(provider);
	};

	return {
		updatePass,
		verifyEmail,
		get,
	};
};
