import type { ServerAuthProvider } from './provider.js';
import type { ServerAuthSession } from './session.js';
import type { ServerAuthCreateSessionHandler } from './sessionHandler.js';
import type { ServerAuthToken } from './token.js';
import type { ServerAuthUser } from './user.js';
import type { Config } from '../config.js';

export type {
	ServerAuthProviderCommon,
	ServerAuthProviderMfaCommon,
	ServerAuthProviderOAuth,
	ServerAuthProviderPassEmail,
	ServerAuthProviderPassMfa,
	ServerAuthProvider,
} from './provider.js';
export type { ServerAuthSession } from './session.js';
export type { ISessionHandler, MiddlewareContext, ServerAuthCreateSessionHandler } from './sessionHandler.js';
export type { ServerAuthToken } from './token.js';
export type { ServerAuthUser } from './user.js';

export type ServerAuth<
	User,
	Provider,
	ProviderWithoutPass,
	Session,
	UserContext = never,
	ProviderContext = never,
	SessionContext = never,
> = {
	config: Config;
	createSessionHandler: ServerAuthCreateSessionHandler<User, Session>;
	provider: ServerAuthProvider<ProviderWithoutPass>;
	session: ServerAuthSession<Session, SessionContext>;
	token: ServerAuthToken;
	user: ServerAuthUser<User, Provider, UserContext, ProviderContext>;
};
