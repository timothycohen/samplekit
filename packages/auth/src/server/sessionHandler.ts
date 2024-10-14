import type {
	Auth,
	Config,
	DbAdapterSession,
	DbAdapterUserAndSession,
	TransformSession,
	ISessionHandler,
	MiddlewareContext,
} from '../types/server/index.js';

// https://github.com/lucia-auth/lucia/blob/main/packages/lucia/src/auth/request.ts

// The basics of session control and the SessionHandler class come from lucia-auth. It's a great library, but the abstraction layer
// 1) modified the schema. The get*Attributes functions allowed mapping, but not the ids, so it required two slightly different types for db direct and lucia adapter
// 2) occassionally made twice the db calls. It's db agnostic, but writing directly for one db allows for more efficient queries
// 3) often broke typing. Everything suddenly showed as "any" until restarting the TS server
// 4) required two sets of functions. One for Lucia's lower level db adapter, and one for the Auth endpoint helper functions which don't use the db adapter because of #2
// 5) reimplemented framework features. Lucia is framework agnostic, so it reimplemented things like cookies and CSRF protection, which SvelteKit already provides
// 6) doesn't support things like passkeys, and the schema isn't conducive to modifications: https://github.com/lucia-auth/lucia/issues/577

type SessionHandlerContext<U, S, SCtx> = {
	dbSession: DbAdapterSession<S>;
	transformSession: TransformSession<S, SCtx>;
	dbUserAndSession: DbAdapterUserAndSession<U, S>;
	config: Config;
};

/** Caches the result of `getSessionUser`, `getVerifiedUser`, and `userOrRedirect` for the duration of the request
 *
 *  A call to `.set` sets the cookie and invalidates the cache
 *
 *  Force a fresh db call with `({ skipCache: true })`
 */
export class SessionHandler<U, S, SCtx> implements ISessionHandler<U, S> {
	private seshUserCache: Promise<{ user: U; session: S } | null> | null;
	private sessionIdCache: string | null;

	private cookie: MiddlewareContext['cookie'];
	private dbSession: DbAdapterSession<S>;
	private transformSession: TransformSession<S, SCtx>;
	private dbUserAndSession: DbAdapterUserAndSession<U, S>;
	private config: Config;

	constructor(ctx: { middlewareContext: MiddlewareContext; sessionHandlerContext: SessionHandlerContext<U, S, SCtx> }) {
		this.seshUserCache = null;
		this.sessionIdCache = ctx.middlewareContext.requestCookie;

		this.cookie = ctx.middlewareContext.cookie;
		this.dbSession = ctx.sessionHandlerContext.dbSession;
		this.transformSession = ctx.sessionHandlerContext.transformSession;
		this.dbUserAndSession = ctx.sessionHandlerContext.dbUserAndSession;
		this.config = ctx.sessionHandlerContext.config;
	}

	private validateSession = async ({ sessionId }: { sessionId: string }): Promise<{ user: U; session: S } | null> => {
		const [session, user] = await this.dbUserAndSession.get({ sessionId });

		// Invalid: delete cookie
		if (!session || !user) {
			this.cookie.delete();
			this.sessionIdCache = null;
			return null;
		}

		const libSession = this.transformSession.toLib(session);

		// Expired: delete cookie and db entry
		if (libSession.idleExpires <= new Date()) {
			await this.dbSession.deleteOne({ sessionId });
			this.cookie.delete();
			this.sessionIdCache = null;
			return null;
		}

		// Side effect: update lastSeen
		if (libSession.lastSeen.getTime() + this.config.lastSeen.updateEvery < Date.now()) {
			await this.dbSession.update({ sessionId, values: { lastSeen: new Date() } });
		}

		// Active: no need to refresh
		if (libSession.activeExpires > new Date()) {
			return { user, session };
		}

		// Idle: refresh cookie and db entry
		const activeExpires = new Date(Date.now() + this.config.sessionExpiresIn.activePeriod);
		const idleExpires = new Date(activeExpires.getTime() + this.config.sessionExpiresIn.idlePeriod);
		if (libSession.persistent) this.cookie.setPersistent({ sessionId, expires: idleExpires });
		else this.cookie.setSession({ sessionId });
		await this.dbSession.update({ sessionId, values: { activeExpires, idleExpires } });

		this.transformSession.updateExpires(session, { activeExpires, idleExpires });

		return { user, session };
	};

	/** Does not consider whether the user is awaiting email or MFA verification */
	public getSessionUser = async ({ skipCache }: { skipCache?: true } = {}): Promise<{
		user: U;
		session: S;
	} | null> => {
		if (this.seshUserCache && !skipCache) return await this.seshUserCache;

		this.seshUserCache = new Promise<null | { user: U; session: S }>((resolve) => {
			if (!this.sessionIdCache) resolve(null);
			else this.validateSession({ sessionId: this.sessionIdCache }).then(resolve);
		});

		return await this.seshUserCache;
	};

	/**
	 * Does not delete the database session. Use `auth.session.delete() for that`
	 */
	public set = ({ session }: { session: null } | { session: Auth.Session }) => {
		const newSessionId = session?.id ?? null;
		if (this.sessionIdCache === newSessionId) return;

		this.sessionIdCache = newSessionId;
		this.seshUserCache = null;

		if (!session) this.cookie.delete();
		else if (session.persistent) this.cookie.setPersistent({ sessionId: session.id, expires: session.idleExpires });
		else this.cookie.setSession({ sessionId: session.id });
	};

	/** The next call to getSessionUser, getVerifiedUser, or userOrRedirect will hit the database
	 *
	 * Does not delete the cookie. Use `set({ session: null })` for that
	 */
	public invalidateCache = () => {
		this.seshUserCache = null;
	};
}
