import { and, eq, lt, ne } from 'drizzle-orm';
import {
	authProviderSchema,
	authProviders,
	db,
	sessionSchema,
	sessions,
	supportedOauthProviders,
	tokens,
	userSchema,
	users,
} from '$lib/db/server';
import { croppedImgSchema } from '$lib/image/common';
import { assertUnreachable } from '$lib/utils/common';
import type {
	Auth,
	DbAdapter,
	DbAdapterProvider,
	DbAdapterSession,
	DbAdapterToken,
	DbAdapterUser,
	DbAdapterUserAndSession,
} from '@samplekit/auth/server';

function isSupportedOAuth(provider: string): provider is DB.Provider.OAuth['provider'] {
	return supportedOauthProviders.includes(provider as (typeof supportedOauthProviders)[number]);
}

const user: DbAdapterUser<DB.User> = {
	insert: async (a) => {
		const validated = userSchema.parse(a);
		await db.insert(users).values(validated as DB.User);
	},
	getById: async ({ userId }) => {
		return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
	},
	getByEmail: async ({ cleanEmail }) => {
		return (await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1))[0];
	},
	delete: async (a) => {
		await db.delete(users).where(eq(users.id, a.userId));
	},
};

const provider: DbAdapterProvider<DB.Provider, Omit<DB.Provider, 'hashedPassword'>> = {
	insert: async (a) => {
		const validated = authProviderSchema.parse(a);
		await db.insert(authProviders).values(validated as DB.Provider);
	},
	getByEmail: async ({ email, kind }) => {
		return (
			await db
				.select()
				.from(authProviders)
				.where(and(eq(authProviders.email, email), eq(authProviders.kind, kind)))
				.limit(1)
		)[0] as DB.Provider | undefined;
	},
	getByUserId: async ({ userId, kind }) => {
		const where =
			kind === 'any'
				? eq(authProviders.userId, userId)
				: and(eq(authProviders.userId, userId), eq(authProviders.kind, kind));

		return (await db.select().from(authProviders).where(where).limit(1))[0] as DB.Provider | undefined;
	},
	updateByEmail: async ({ email, sourceKind, values }) => {
		await db
			.update(authProviders)
			.set(values)
			.where(and(eq(authProviders.email, email), eq(authProviders.kind, sourceKind)));
	},
	updateByUserId: async ({ kind, userId, values }) => {
		if (values.kind === 'oauth' && values.provider && !isSupportedOAuth(values.provider)) {
			throw new Error(`invalid oauth provider: only ${supportedOauthProviders.toString()} supported`);
		}

		const vals = values as Omit<typeof values, 'provider'> & { provider: (typeof supportedOauthProviders)[number] };

		await db
			.update(authProviders)
			.set(vals)
			.where(and(eq(authProviders.userId, userId), eq(authProviders.kind, kind)));
	},
	removeHashedPassword: (a) => {
		const { hashedPassword: _, ...rest } = a;
		return rest;
	},
	deleteByUserId: async (a) => {
		await db.delete(authProviders).where(eq(authProviders.userId, a.userId));
	},
};

const session: DbAdapterSession<DB.Session> = {
	insert: async (a) => {
		const validated = sessionSchema.parse(a);
		await db.insert(sessions).values(validated);
	},
	getAll: async ({ userId }) => {
		return await db.select().from(sessions).where(eq(sessions.userId, userId));
	},
	update: async (a) => {
		await db.update(sessions).set(a.values).where(eq(sessions.id, a.sessionId));
	},
	deleteOne: async ({ sessionId }) => {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	},
	deleteOthers: async ({ sessionId, userId }) => {
		await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.id, sessionId)));
	},
	deleteMany: async ({ userId }) => {
		await db.delete(sessions).where(eq(sessions.userId, userId));
	},
};

const userAndSession: DbAdapterUserAndSession<DB.User, DB.Session> = {
	get: async (a) => {
		const res = (
			await db
				.select()
				.from(sessions)
				.innerJoin(users, eq(users.id, sessions.userId))
				.where(eq(sessions.id, a.sessionId))
				.limit(1)
		)[0];

		if (!res || !res.session || !res.user_account) return [null, null];

		return [res.session, res.user_account];
	},
};

const token: DbAdapterToken = {
	getByUserId: async ({ tokenKind, userId }) => {
		const { table } = getTable(tokenKind);
		const res = (await db.select().from(table).where(eq(table.userId, userId)).limit(1))[0];
		if (!res) return null;
		const token = { ...res, kind: tokenKind } as typeof tokenKind extends 'passkey_challenge'
			? Auth.Token.UnlimSendUnlimAttempt
			: typeof tokenKind extends 'setup_authenticator'
				? Auth.Token.UnlimSendLimAttempt
				: typeof tokenKind extends 'email_veri' | 'pw_reset'
					? Auth.Token.LimSendUnlimAttempt
					: typeof tokenKind extends 'sms_veri' | 'setup_sms_veri'
						? Auth.Token.LimSendLimAttempt
						: never;
		return token;
	},
	getByToken: async ({ token, tokenKind }) => {
		const { table } = getLimSendUnlimAttemptTable(tokenKind);
		const res = (await db.select().from(table).where(eq(table.token, token)).limit(1))[0];
		if (!res) return null;
		// @ts-expect-error getLimSendUnlimAttemptTable ensures res is this kind
		res.kind = tokenKind;
		return res as typeof res & { kind: DB.Token.Kind.LimSendUnlimAttempt };
	},
	upsert: async ({ newToken }) => {
		const kind = newToken.kind;
		const { table, validator } = getTable(kind);

		const validated = validator.parse(newToken);
		await db.insert(table).values(validated).onConflictDoUpdate({ target: table.userId, set: validated });
	},
	updateLimSend: async (a) => {
		const { table } = getLimSendTable(a.tokenKind);
		await db.update(table).set(a.values).where(eq(table.userId, a.userId));
	},
	updateLimAttempt: async (a) => {
		const { table } = getLimAttemptTable(a.tokenKind);
		await db.update(table).set(a.values).where(eq(table.userId, a.userId));
	},
	updateSetupSMSPhoneNumber: async ({ phoneNumber, userId }) => {
		const table = tokens.setupSMSVeri;
		await db.update(table).set({ phoneNumber }).where(eq(table.userId, userId));
	},
	deleteByUserId: async ({ tokenKind, userId }) => {
		const { table } = getTable(tokenKind);
		await db.delete(table).where(eq(table.userId, userId));
	},
	deleteByToken: async ({ token, tokenKind }) => {
		const { table } = getLimSendUnlimAttemptTable(tokenKind);
		await db.delete(table).where(eq(table.token, token));
	},
	deleteExpired: async ({ tokenKind }) => {
		const { table } = getTable(tokenKind);
		return (await db.delete(table).where(lt(table.expires, new Date()))).rowCount ?? 0;
	},
};

function getTable(tokenName: DB.Token.Kind.All) {
	switch (tokenName) {
		case 'email_veri':
			return { table: tokens.emailVeri, validator: tokens.emailVeriSchema };
		case 'pw_reset':
			return { table: tokens.pwReset, validator: tokens.pwResetSchema };
		case 'setup_sms_veri':
			return { table: tokens.setupSMSVeri, validator: tokens.setupSMSVeriSchema };
		case 'sms_veri':
			return { table: tokens.smsVeri, validator: tokens.smsVeriSchema };
		case 'setup_authenticator':
			return { table: tokens.setupAuthenticator, validator: tokens.setupAuthenticatorSchema };
		case 'passkey_challenge':
			return { table: tokens.passkeyChallenge, validator: tokens.passkeyChallengeSchema };
	}
	assertUnreachable(tokenName);
}

const getLimSendUnlimAttemptTable = (tokenName: DB.Token.Kind.LimSendUnlimAttempt) => {
	switch (tokenName) {
		case 'email_veri':
			return { table: tokens.emailVeri };
		case 'pw_reset':
			return { table: tokens.pwReset };
	}
	assertUnreachable(tokenName);
};

const getLimSendTable = (tokenName: DB.Token.Kind.LimSend) => {
	switch (tokenName) {
		case 'email_veri':
			return { table: tokens.emailVeri };
		case 'pw_reset':
			return { table: tokens.pwReset };
		case 'setup_sms_veri':
			return { table: tokens.setupSMSVeri };
		case 'sms_veri':
			return { table: tokens.smsVeri };
	}
	assertUnreachable(tokenName);
};

const getLimAttemptTable = (tokenName: DB.Token.Kind.LimAttempt) => {
	switch (tokenName) {
		case 'setup_authenticator':
			return { table: tokens.setupAuthenticator };
		case 'sms_veri':
			return { table: tokens.smsVeri };
		case 'setup_sms_veri':
			return { table: tokens.setupSMSVeri };
	}
	assertUnreachable(tokenName);
};

export const dbAdapter: DbAdapter<
	DB.User,
	DB.Provider,
	Omit<DB.Provider, 'hashedPassword'>,
	DB.Session,
	void,
	void,
	{ os: string | null; browser: string | null; ip: string | null }
> = {
	user,
	provider,
	session,
	token,
	userAndSession,
	userToAuth: (a) => {
		const { avatar, ...rest } = a;
		return { ...rest, avatar: avatar?.url ?? null };
	},
	userFromAuth: (a) => {
		const { avatar: url, ...rest } = a;
		const validated = croppedImgSchema.safeParse({ url });
		const avatar = validated.success ? validated.data : null;
		return { ...rest, avatar };
	},
	sessionFromAuth: (a, ctx) => ({ ...a, ...ctx }),
	providerFromAuth: (a) => {
		if (a.kind === 'pass') return a;
		if (a.kind === 'oauth' && a.provider && !isSupportedOAuth(a.provider)) {
			throw new Error(`invalid oauth provider: only ${supportedOauthProviders.toString()} supported`);
		} else {
			return a as DB.Provider.OAuth;
		}
	},
};
