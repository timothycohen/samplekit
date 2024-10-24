import type { Auth } from './auth.js';

type Empty = undefined | null;

export interface DbAdapterUser<ConfigUser> {
	insert: (a: ConfigUser) => Promise<void>;
	getById: ({ userId }: { userId: string }) => Promise<ConfigUser | Empty>;
	getByEmail: ({ cleanEmail }: { cleanEmail: string }) => Promise<ConfigUser | Empty>;
	delete: (a: { userId: string }) => Promise<void>;
}

export interface DbAdapterProvider<ConfigProvider, ConfigProviderWithoutPass> {
	insert: (a: ConfigProvider) => Promise<void>;
	getByEmail: (a: { email: string; kind: Auth.Provider['kind'] }) => Promise<ConfigProvider | Empty>;
	getByUserId: (a: { userId: string; kind: Auth.Provider['kind'] | 'any' }) => Promise<ConfigProvider | Empty>;
	updateByEmail: (a: {
		email: string;
		sourceKind: Auth.Provider['kind'];
		values: Omit<Partial<Auth.Provider>, 'userId' | 'kind' | 'provider'>;
	}) => Promise<void>;
	updateByUserId: (a: {
		userId: string;
		kind: Auth.Provider['kind'];
		values: Omit<Partial<Auth.Provider>, 'userId'>;
	}) => Promise<void>;
	removeHashedPassword: (a: ConfigProvider) => ConfigProviderWithoutPass;
	deleteByUserId: (a: { userId: string }) => Promise<void>;
}

export interface DbAdapterSession<ConfigSession> {
	insert: (a: ConfigSession) => Promise<void>;
	getAll: ({ userId }: { userId: string }) => Promise<ConfigSession[]>;
	update: (a: { sessionId: string; values: Omit<Partial<Auth.Session>, 'id'> }) => Promise<void>;
	deleteOne: ({ sessionId }: { sessionId: string }) => Promise<void>;
	deleteOthers: ({ sessionId, userId }: { userId: string; sessionId: string }) => Promise<void>;
	deleteMany: ({ userId }: { userId: string }) => Promise<void>;
}

export interface DbAdapterUserAndSession<ConfigUser, ConfigSession> {
	get: (a: { sessionId: string }) => Promise<[null, null] | [ConfigSession, ConfigUser]>;
}

export interface DbAdapterToken {
	getByUserId(a: {
		userId: string;
		tokenKind: Auth.Token.Kind.UnlimSendUnlimAttempt;
	}): Promise<Auth.Token.UnlimSendUnlimAttempt | Empty>;
	getByUserId(a: {
		userId: string;
		tokenKind: Auth.Token.Kind.UnlimSendLimAttempt;
	}): Promise<Auth.Token.UnlimSendLimAttempt | Empty>;
	getByUserId(a: {
		userId: string;
		tokenKind: Auth.Token.Kind.LimSendUnlimAttempt;
	}): Promise<Auth.Token.LimSendUnlimAttempt | Empty>;
	getByUserId(a: {
		userId: string;
		tokenKind: Auth.Token.Kind.LimSendLimAttempt;
	}): Promise<Auth.Token.LimSendLimAttempt | Empty>;
	// Only LimSendUnlimAttempt have unique token properties
	getByToken: (a: {
		token: string;
		tokenKind: Auth.Token.Kind.LimSendUnlimAttempt;
	}) => Promise<Auth.Token.LimSendUnlimAttempt | Empty>;
	upsert: ({ newToken }: { newToken: Auth.Token.All }) => Promise<void>;
	updateLimSend: (a: {
		tokenKind: Auth.Token.Kind.LimSend;
		values: Pick<Auth.Token.LimSend, 'sendCount' | 'sendTime'>;
		userId: string;
	}) => Promise<void>;
	updateLimAttempt: (a: {
		tokenKind: Auth.Token.Kind.LimAttempt;
		values: Pick<Auth.Token.LimAttempt, 'veriAttemptCount'>;
		userId: string;
	}) => Promise<void>;
	updateSetupSMSPhoneNumber: ({ phoneNumber, userId }: { phoneNumber: string; userId: string }) => Promise<void>;
	deleteByUserId: (a: { userId: string; tokenKind: Auth.Token.Kind.All }) => Promise<void>;
	// Only LimSendUnlimAttempt have unique token properties
	deleteByToken: (a: { token: string; tokenKind: Auth.Token.Kind.LimSendUnlimAttempt }) => Promise<void>;
	deleteExpired: (a: { tokenKind: Auth.Token.Kind.All }) => Promise<number>;
}

/**
 * ### The dbAdapter provides the atomic operations needed to implement the auth API.
 *
 * The first four type arguments define your schema.
 *
 * If your schema is missing properties required by the `Auth` schema, the `DbAdapter` requires a transform function (`userToAuth`, `providerToAuth`, or `sessionToAuth`) to convert your schema to the `Auth` schema.
 *
 * Similarly, if your schema has properties not in the `Auth` schema, the `DbAdapter` will expect transform functions (`userFromAuth`, `providerFromAuth`, or `sessionFromAuth`) to convert the `Auth` schema to your schema.
 *
 * If your database has the same information but uses different names, you can transform between theme in these functions immediately.
 *
 * For example, the `Auth.User` type has a `string | null` avatar property (returned by Google OAuth). If you want to save this data with a default cropping, you can do that in the `userFromAuth` function.
 *
 * If your schema has information not included in the `Auth` schema, you can define optional `Ctx` types on this `DbAdapter`.
 *
 * For example, if `CtxSession` is defined, two things happen:
 ** The `DbAdapter` adds `ctx` as a second argument of the `sessionFromAuth` function.
 ** Endpoint functions (for example `auth.session.create`) will expect a second argument of type `CtxSession`
 *
 * The data is passed from the endpoints into the `*fromAuth` functions before being inserted into the database and returned. A similar thing happens with the other `Ctx` arguments.
 */
// prettier-ignore
export type DbAdapter<
	ConfigUser,
	ConfigProvider,
	ConfigProviderWithoutPass,
	ConfigSession,
	CtxUser = void,
	CtxProvider = void,
	CtxSession = void,
> = {
	user: DbAdapterUser<ConfigUser>;
	provider: DbAdapterProvider<ConfigProvider, ConfigProviderWithoutPass>;
	session: DbAdapterSession<ConfigSession>;
	token: DbAdapterToken;
	userAndSession: DbAdapterUserAndSession<ConfigUser, ConfigSession>;
}
  & ([ConfigUser] extends [Auth.User] ? { userToAuth?: UserToAuth<ConfigUser> } : { userToAuth: UserToAuth<ConfigUser> })
  & ([Auth.User] extends [ConfigUser] ? { userFromAuth?: UserFromAuth<ConfigUser, CtxUser> } : { userFromAuth: UserFromAuth<ConfigUser, CtxUser> })

  & ([ConfigProvider] extends [Auth.Provider] ? { providerToAuth?: ProviderToAuth<ConfigProvider> } : { providerToAuth: ProviderToAuth<ConfigProvider> })
	& ([Auth.Provider] extends [ConfigProvider] ? { providerFromAuth?: ProviderFromAuth<ConfigProvider, CtxProvider> } : { providerFromAuth: ProviderFromAuth<ConfigProvider, CtxProvider> })

  &	([ConfigSession] extends [Auth.Session] ? { sessionToAuth?: SessionToAuth<ConfigSession> } : { sessionToAuth: SessionToAuth<ConfigSession> })
  & ([Auth.Session] extends [ConfigSession] ? { sessionFromAuth?: SessionFromAuth<ConfigSession, CtxSession> } : { sessionFromAuth: SessionFromAuth<ConfigSession, CtxSession> })
  & ([ConfigSession] extends [{ activeExpires: Date, idleExpires: Date }] ? { updateExpires?: UpdateExpires<ConfigSession> } : { updateExpires: UpdateExpires<ConfigSession> });

export type UserToAuth<ConfigUser> = (a: ConfigUser) => Auth.User;
export type UserFromAuth<ConfigUser, CtxUser> = (a: Auth.User, ctx: CtxUser) => ConfigUser;

export type ProviderToAuth<ConfigProvider> = (a: ConfigProvider) => Auth.Provider;
export type ProviderFromAuth<ConfigProvider, CtxProvider> = (a: Auth.Provider, ctx: CtxProvider) => ConfigProvider;

export type SessionToAuth<ConfigSession> = (a: ConfigSession) => Auth.Session;
export type SessionFromAuth<ConfigSession, CtxSession> = (a: Auth.Session, ctx: CtxSession) => ConfigSession;
export type UpdateExpires<ConfigSession> = (
	session: ConfigSession,
	expires: { activeExpires: Date; idleExpires: Date },
) => void;

export type TransformUser<User, UserContext> = {
	toLib: UserToAuth<User>;
	toClient: UserFromAuth<User, UserContext>;
};
export type TransformProvider<Provider, ProviderContext> = {
	toLib: ProviderToAuth<Provider>;
	toClient: ProviderFromAuth<Provider, ProviderContext>;
};
export type TransformSession<Session, SessionContext> = {
	toLib: SessionToAuth<Session>;
	toClient: SessionFromAuth<Session, SessionContext>;
	updateExpires: UpdateExpires<Session>;
};
