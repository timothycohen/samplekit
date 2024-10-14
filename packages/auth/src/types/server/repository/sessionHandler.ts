import type { Auth } from '../auth.js';

export type MiddlewareContext = {
	requestCookie: string | null;
	cookie: {
		setPersistent: (a: { sessionId: string; expires: Date }) => void;
		setSession: (a: { sessionId: string }) => void;
		delete: () => void;
	};
};

export type ISessionHandler<U, S> = {
	getSessionUser: (a?: { skipCache?: true }) => Promise<{ user: U; session: S } | null>;
	set: ({ session }: { session: null } | { session: Auth.Session }) => void;
	invalidateCache: () => void;
};

export type ServerAuthCreateSessionHandler<U, S> = (middlewareContext: MiddlewareContext) => ISessionHandler<U, S>;
