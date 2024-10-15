import { boolean, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { uniqueUserReference } from './utils';
import type { Auth, AuthenticatorDevice } from '@samplekit/auth/server';

export const supportedOauthProviders = ['google'] as const;
export const supportedPassProviders = ['email'] as const;
export const authProviders = pgTable('auth_provider', {
	kind: varchar('kind', { enum: ['oauth', 'pass'] }).notNull(),
	email: varchar('email').notNull(),
	provider: varchar('provider', { enum: [...supportedOauthProviders, ...supportedPassProviders] }).notNull(),
	...uniqueUserReference({ onDelete: 'cascade' }), // set up to only allow one auth provider per user
	emailVerified: boolean('email_verified').notNull(),
	hashedPassword: varchar('hashed_password'), // NonNullable if the provider is email-pass, otherwise null
	// The following MFA methods are null if MFA is disabled (google auth)
	authenticator: varchar('authenticator'), // secret
	passkeys: jsonb('passkeys').$type<AuthenticatorDevice[]>(), // user devices
	sms: varchar('sms'), // sanitized phone number
});
export const authProviderSchema = createSelectSchema(authProviders);

export namespace ProviderNS {
	export type OAuth = {
		kind: 'oauth';
		email: string;
		userId: string;
		emailVerified: true;
		hashedPassword: null;
		authenticator: null;
		passkeys: null;
		sms: null;
	} & { provider: (typeof supportedOauthProviders)[number] };

	export type Pass = {
		kind: 'pass';
		email: string;
		userId: string;
		emailVerified: boolean;
		hashedPassword: string;
		authenticator: string | null; // secret
		passkeys: AuthenticatorDevice[] | null; // user devices
		sms: string | null; // sanitized phone number
	} & { provider: (typeof supportedPassProviders)[number] };

	export type Id =
		| { kind: Auth.Provider.OAuth['kind']; provider: Auth.Provider.OAuth['provider'] }
		| { kind: Auth.Provider.Pass['kind']; provider: Auth.Provider.Pass['provider'] };
}

export type ProviderT = ProviderNS.OAuth | ProviderNS.Pass;

export type MFAsT = Pick<ProviderT, 'authenticator' | 'passkeys' | 'sms'>;
export namespace MFAsNS {
	export type Enabled = Record<keyof MFAsT, boolean>;
	export type Kind = keyof Enabled;
}
