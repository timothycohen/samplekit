import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { userReference } from './utils';

export const sessions = pgTable('session', {
	id: varchar('id').primaryKey(),
	...userReference({ onDelete: 'cascade' }),
	idleExpires: timestamp('idle_expires', { mode: 'date' }).notNull(),
	activeExpires: timestamp('active_expires', { mode: 'date' }).notNull(),
	awaitingMFA: boolean('awaiting_mfa').notNull(),
	awaitingEmailVeri: boolean('awaiting_email_veri').notNull(),
	persistent: boolean('persistent').notNull(),

	// device info (not required for auth)
	os: varchar('os'),
	browser: varchar('browser'),
	ip: varchar('ip'),

	// time info (not required for auth)
	login: timestamp('login', { mode: 'date' }).notNull(),
	lastSeen: timestamp('last_seen', { mode: 'date' }).notNull(),

	/**
	 ** purpose: verify email, pw, or mfa (depending on provider) before allowing account modifications (updating mfa, deleting account, etc.)
	 ** created: seshConfFromEmailVeri, seshConfFromPassword, seshConfFromSMS, seshConfFromAuthenticator, seshConfFromPasskey,
	 ** transport: never sent
	 ** checked: restricts access to account/delete, mfa/update, SMSSetupFromSeshConf
	 ** validated: deleteUserWithSeshConf, registerMFA_Authenticator_WithSeshConf, registerMFA_SMS_WithSeshConfAndSetupSMS, removeMFAWithSeshConf
	 */
	tempConfirmationExpires: timestamp('temp_confirmation_expires', { mode: 'date' }).notNull(),
});
export const sessionSchema = createSelectSchema(sessions);
