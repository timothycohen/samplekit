import { createConfigDefaults } from './config.js';
import { createAuthProvider } from './provider/index.js';
import { createAuthSession } from './session/index.js';
import { SessionHandler, type MiddlewareContext } from './sessionHandler/index.js';
import { createAuthToken } from './token/index.js';
import { createAuthUser } from './user/index.js';
import type {
	Auth,
	Config,
	DbAdapter,
	RequiredConfig,
	TransformProvider,
	TransformSession,
	TransformUser,
} from './types/index.js';

export type { MiddlewareContext, SessionHandler, SessionHandlerContext } from './sessionHandler/index.js';
export type * from './types/index.js';

export const createAuth = <
	User,
	Provider,
	ProviderWithoutPass,
	Session,
	UserContext = never,
	ProviderContext = never,
	SessionContext = never,
>({
	config,
	dbAdapter,
}: {
	config: RequiredConfig;
	dbAdapter: DbAdapter<User, Provider, ProviderWithoutPass, Session, UserContext, ProviderContext, SessionContext>;
}) => {
	const {
		provider: dbProvider,
		session: dbSession,
		token: dbToken,
		user: dbUser,
		userAndSession: dbUserAndSession,
	} = dbAdapter;

	const transformUser: TransformUser<User, UserContext> = {
		toLib: dbAdapter.userToAuth ?? ((a: User) => a as Auth.User),
		toClient: dbAdapter.userFromAuth ?? ((a: Auth.User) => a as User),
	};

	const transformProvider: TransformProvider<Provider, ProviderContext> = {
		toLib: dbAdapter.providerToAuth ?? ((a: Provider) => a as Auth.Provider),
		toClient: dbAdapter.providerFromAuth ?? ((a: Auth.Provider) => a as Provider),
	};

	const transformSession: TransformSession<Session, SessionContext> = {
		toLib: dbAdapter.sessionToAuth ?? ((a: Session) => a as Auth.Session),
		toClient: dbAdapter.sessionFromAuth ?? ((a: Auth.Session) => a as Session),
		updateExpires:
			dbAdapter.updateExpires ??
			((a, { activeExpires, idleExpires }: { activeExpires: Date; idleExpires: Date }) => {
				(a as Auth.Session).activeExpires = activeExpires;
				(a as Auth.Session).idleExpires = idleExpires;
			}),
	};

	const configDefaults = createConfigDefaults({ authenticatorName: config.authenticatorName });
	const fullConfig: Config = { ...configDefaults, ...config };

	return {
		config: fullConfig,
		createSessionHandler: (middlewareContext: MiddlewareContext) =>
			new SessionHandler<User, Session, SessionContext>({
				middlewareContext,
				sessionHandlerContext: { config: fullConfig, dbSession, dbUserAndSession, transformSession },
			}),
		provider: createAuthProvider<Provider, ProviderWithoutPass, ProviderContext>({
			config: fullConfig,
			dbProvider,
			transformProvider,
		}),
		session: createAuthSession<Session, SessionContext>({ config: fullConfig, dbSession, transformSession }),
		token: createAuthToken<Provider, ProviderWithoutPass, ProviderContext>({
			config: fullConfig,
			dbProvider,
			dbToken,
			transformProvider,
		}),
		user: createAuthUser<User, Provider, ProviderWithoutPass, Session, UserContext, ProviderContext>({
			config: fullConfig,
			dbUser,
			dbProvider,
			dbSession,
			dbToken,
			transformUser,
			transformProvider,
		}),
	};
};
