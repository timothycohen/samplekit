import { tokenKinds } from './token/consts.js';
import type {
	Auth,
	Config,
	DbAdapterProvider,
	DbAdapterSession,
	DbAdapterToken,
	DbAdapterUser,
	TransformProvider,
	TransformUser,
	ServerAuthUser,
} from '../types/server/index.js';

export const createAuthUser: <U, P, PWOP, S, UCtx, PCtx>(a: {
	config: Config;
	dbUser: DbAdapterUser<U>;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformUser: TransformUser<U, UCtx>;
	transformProvider: TransformProvider<P, PCtx>;
	dbSession: DbAdapterSession<S>;
	dbToken: DbAdapterToken;
}) => ServerAuthUser<U, P, UCtx, PCtx> = ({
	config,
	dbUser,
	dbProvider,
	transformUser,
	transformProvider,
	dbSession,
	dbToken,
}) => ({
	get: async (args) => {
		if (args.email) return await dbUser.getByEmail({ cleanEmail: config.clean.email(args.email) });
		else if (args.userId) return await dbUser.getById({ userId: args.userId });
	},
	createEmailPass: async (args, passToTransformUser, passToTransformProvider) => {
		const cleanEmail = config.clean.email(args.email);
		const storedUser = await dbUser.getByEmail({ cleanEmail });
		if (storedUser) return { error: 'email_taken' };

		const userId = config.generateId();
		const hashedPassword = await config.passwordHash.generate(args.rawPassword);

		const user: Auth.User = {
			id: userId,
			email: cleanEmail,
			givenName: args.givenName,
			familyName: args.familyName,
			avatar: null,
			joinedOn: new Date(),
		};
		const provider: Auth.Provider = {
			kind: 'pass' as const,
			provider: 'email' as const,
			email: cleanEmail,
			userId,
			hashedPassword,
			emailVerified: false,
			authenticator: null,
			passkeys: null,
			sms: null,
		};

		const configUser = transformUser.toClient(user, passToTransformUser);
		await dbUser.insert(configUser);
		await dbProvider.insert(transformProvider.toClient(provider, passToTransformProvider));

		return { user: configUser };
	},
	getOrCreateOAuth: async (args, oauthProvider, passToTransformUser, passToTransformProvider) => {
		const storedUser = await dbUser.getByEmail({ cleanEmail: args.clean_email });

		if (!storedUser) {
			const userId = config.generateId();
			const hashedPassword = null;

			const user: Auth.User = {
				id: userId,
				email: args.clean_email,
				givenName: args.given_name,
				familyName: args.family_name,
				avatar: args.picture,
				joinedOn: new Date(),
			};

			const provider = {
				kind: 'oauth' as const,
				provider: oauthProvider,
				email: args.clean_email,
				userId,
				hashedPassword,
				emailVerified: true as const,
				authenticator: null,
				passkeys: null,
				sms: null,
			};

			const configUser = transformUser.toClient(user, passToTransformUser);
			const configProvider = transformProvider.toClient(provider, passToTransformProvider);
			await dbUser.insert(configUser);
			await dbProvider.insert(configProvider);

			return { user: configUser, provider: configProvider };
		}

		const authUser = transformUser.toLib(storedUser);
		const storedOAuthProvider = await dbProvider.getByUserId({ kind: 'oauth', userId: authUser.id });
		// SAFETY: If user exists, so does provider. If not 'oauth', then 'pass'
		if (!storedOAuthProvider) return { error: 'email_taken' };

		return { user: storedUser, provider: storedOAuthProvider };
	},
	/** Delete sessions, providers, and user */
	delete: async ({ userId }) => {
		await Promise.all([
			tokenKinds.map(async (tokenKind) => dbToken.deleteByUserId({ tokenKind, userId })),
			dbSession.deleteMany({ userId }),
			dbProvider.deleteByUserId({ userId }),
		]);
		await dbUser.delete({ userId });
	},
});
