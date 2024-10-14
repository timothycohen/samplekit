export { createAuth } from './auth.js';

export type {
	DbAdapter,
	DbAdapterProvider,
	DbAdapterSession,
	DbAdapterToken,
	DbAdapterUser,
	DbAdapterUserAndSession,
	ProviderFromAuth,
	ProviderToAuth,
	SessionFromAuth,
	SessionToAuth,
	UpdateExpires,
	UserFromAuth,
	UserToAuth,
} from '../types/server/adapters.js';
export type { Auth, AuthenticatorDevice } from '../types/server/auth.js';
export type { Config, DefaultConfig, RequiredConfig } from '../types/server/config.js';
export type { Cookies } from '../types/server/cookie.js';
export type { TokenErr } from '../types/server/errors.js';
export type { MiddlewareContext, ISessionHandler, ServerAuth } from '../types/server/repository/index.js';
