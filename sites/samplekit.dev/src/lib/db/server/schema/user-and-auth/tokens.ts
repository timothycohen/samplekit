import { pgTable, smallint, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { uniqueUserReference } from './utils';

const base = () => ({
	...uniqueUserReference({ onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// limit sends to sms/email
const limSend = () => ({
	sendCount: smallint('send_count').notNull(),
	sendTime: timestamp('send_time', { mode: 'date' }).notNull(),
});

// limit attempts when the user is known (mfa, sms verification)
const limAttempt = () => ({
	veriAttemptCount: smallint('veri_attempt_count').notNull(),
	veriAttemptTime: timestamp('veri_attempt_time', { mode: 'date' }),
});

const unlimSendUnlimAttempt = () => ({
	...base(),
	token: varchar('token').notNull(),
});
const unlimSendLimAttempt = () => ({
	...base(),
	...limAttempt(),
	token: varchar('token').notNull(),
});
const limSendUnlimAttempt = () => ({
	...base(),
	...limSend(),
	token: varchar('token').notNull().unique(),
});
const limSendLimAttempt = () => ({
	...base(),
	...limSend(),
	...limAttempt(),
	token: varchar('token').notNull(),
});

/** Passkey: unlimSend, unlimAttempt. noLimAttempt because the device handles it
 ** purpose: hold the base64url encoded passkey challenge
 ** created: getPasskeyAuthOpts, mfa/update/register/passkeys
 ** transport: never sent. The options are passed to the client
 ** validated: loginWithPasskey, seshConfFromPasskey, registerMFA_Passkey_WithSeshConfAndPasskey
 */
export const passkeyChallenge = pgTable('token_passkey_challenge', unlimSendUnlimAttempt()); // passkey challenge is NoMaxAttempt because the device handles it

/** Authenticator: unlimSend, limAttempt
 ** purpose: hold the secret while the user adds the authenticator app (transfered to mfas_enabled.authenticator)
 ** created: mfa/update/register/authenticator
 ** transport: never sent. the generated key is shown directly on the page via QR code
 ** validated: registerMFA_Authenticator_WithSeshConf
 */
export const setupAuthenticator = pgTable('token_setup_authenticator', unlimSendLimAttempt());

/** Email Verification: limSend, unlimAttempt
 ** purpose: verify user's email (on first signup and to delete their account)
 ** creation: sendSeshConfToken (used when the provider is Google so there's no password or MFA to confirm), resendSignupEmailVerification, /signup
 ** transport: email
 ** validated: seshConfFromEmailVeri, verifyEmailWithToken
 */
export const emailVeri = pgTable('token_email_veri', limSendUnlimAttempt());

/** Password Reset: limSend, unlimAttempt
 ** purpose: verify user has access to email before allowing them to reset password
 ** created: changeToEmailPassProvider, emailPassReset
 ** transport: email
 ** checked: password-update/[token] load
 ** validated: createNewPassFromPwReset
 */
export const pwReset = pgTable('token_pw_reset', limSendUnlimAttempt());

/** SMS Verification: limSend, limAttempt
 ** purpose: verify sms mfa method (login or create a user confirmed flag)
 ** created: sendSMSVeri
 ** transport: phone
 ** validated: loginWithSMS, seshConfFromSMS
 */
export const smsVeri = pgTable('token_sms_veri', limSendLimAttempt());

/** Setup SMS Verification: limSend, limAttempt. Additional: holds the phone number
 ** purpose: ensure the user has access to the phone number they're adding and hold the phoneNumber (transfered to mfas_enabled.phone_number)
 ** created: SMSSetupFromSeshConf
 ** transport: phone
 ** validated: registerMFA_SMS_WithSeshConfAndSetupSMS
 */
export const setupSMSVeri = pgTable('token_setup_sms_veri', {
	...limSendLimAttempt(),
	phoneNumber: varchar('phone_number').notNull(),
});

export const unlimSendUnlimAttemptKinds = ['passkey_challenge'] as const;
export const unlimSendLimAttemptKinds = ['setup_authenticator'] as const;
export const limSendUnlimAttemptKinds = ['email_veri', 'pw_reset'] as const;
export const limSendLimAttemptKinds = ['sms_veri', 'setup_sms_veri'] as const;

// export const limSendKinds = [...limSendUnlimAttemptKinds, ...limSendLimAttemptKinds] as const;
// export const limAttemptKinds = [...unlimSendLimAttemptKinds, ...limSendLimAttemptKinds] as const;
const kinds = [
	...unlimSendUnlimAttemptKinds,
	...unlimSendLimAttemptKinds,
	...limSendUnlimAttemptKinds,
	...limSendLimAttemptKinds,
] as const;

export const tokens = {
	emailVeri,
	smsVeri,
	pwReset,
	setupAuthenticator,
	passkeyChallenge,
	setupSMSVeri,
	emailVeriSchema: createInsertSchema(emailVeri),
	smsVeriSchema: createInsertSchema(smsVeri),
	pwResetSchema: createInsertSchema(pwReset),
	setupSMSVeriSchema: createInsertSchema(setupSMSVeri),
	setupAuthenticatorSchema: createInsertSchema(setupAuthenticator),
	passkeyChallengeSchema: createInsertSchema(passkeyChallenge),
	kinds: kinds,
};

export namespace TokenNS {
	export namespace Kind {
		export type UnlimSendUnlimAttempt = (typeof unlimSendUnlimAttemptKinds)[number];
		export type UnlimSendLimAttempt = (typeof unlimSendLimAttemptKinds)[number];
		export type LimSendUnlimAttempt = (typeof limSendUnlimAttemptKinds)[number];
		export type LimSendLimAttempt = (typeof limSendLimAttemptKinds)[number];

		export type UnlimSend = UnlimSendUnlimAttempt | UnlimSendLimAttempt;
		export type LimSend = LimSendUnlimAttempt | LimSendLimAttempt;
		export type UnlimAttempt = UnlimSendUnlimAttempt | LimSendUnlimAttempt;
		export type LimAttempt = UnlimSendLimAttempt | LimSendLimAttempt;
		export type All = UnlimSendUnlimAttempt | UnlimSendLimAttempt | LimSendUnlimAttempt | LimSendLimAttempt;
	}

	type _Base = { token: string; userId: string; expires: number };
	type _LimSend = { sendCount: number; sendTime: number };
	type _LimAttempt = { veriAttemptCount: number; veriAttemptTime: number | null };

	export type UnlimSendUnlimAttempt = _Base;
	export type UnlimSendLimAttempt = _Base & _LimAttempt;
	export type LimSendUnlimAttempt = _Base & _LimSend;
	export type LimSendLimAttempt = _Base & _LimAttempt & _LimSend;
	export type SetupSMSVeri = LimSendLimAttempt & { phoneNumber: string };
	export type All = UnlimSendUnlimAttempt & Partial<SetupSMSVeri>;

	export type UnlimSend = UnlimSendUnlimAttempt | UnlimSendLimAttempt;
	export type LimSend = LimSendUnlimAttempt | LimSendLimAttempt;
	export type UnlimAttempt = UnlimSendUnlimAttempt | LimSendUnlimAttempt;
	export type LimAttempt = UnlimSendLimAttempt | LimSendLimAttempt;
}
