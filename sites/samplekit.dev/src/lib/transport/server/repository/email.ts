import { PUBLIC_ORIGIN } from '$env/static/public';
import { sendEmail as send } from '../email';
import type { Transports } from './types';

export const email: Transports['email'] = {
	send: {
		//#region tokens
		emailVeriToken: async ({ email, token }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Congrats on your new SampleKit account!',
					header: 'Thanks for signing up!',
					body: 'Please verify your email address to get full access.',
					button_text: 'Verify Email',
					href: `${PUBLIC_ORIGIN}/signup/email-verification/${token}.json`,
					templateId: 'authEmails',
				},
			}),
		passwordResetToken: async ({ email, token }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Reset SampleKit password',
					header: 'Reset your password',
					body: "Need to update your password? Click the button below. Please note that your password will not change unless you update it through this link. If you didn't request a password reset, you can safely ignore this email. The link will expire in 30 minutes.",
					button_text: 'Reset my password',
					href: `${PUBLIC_ORIGIN}/password-update/${token}`,
					templateId: 'authEmails',
				},
			}),
		seshConfToken: async ({ email, token, redirectPath }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Confirmation Link',
					header: "Here's your confirmation link",
					body: 'Use this link to confirm your email and continue.',
					button_text: 'Verify',
					href: `${PUBLIC_ORIGIN}/account/verify/email/${token}.json?next=${redirectPath}`,
					templateId: 'authEmails',
				},
			}),
		//#endregion tokens
		//#region fail
		passwordResetNoAccount: async ({ email }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Reset SampleKit password',
					header: 'Reset your password',
					body: "A password reset was attempted, but there is no account associated with this email address. If you'd like to sign up, please use the button below.",
					button_text: 'Sign up',
					href: `${PUBLIC_ORIGIN}/signup`,
					templateId: 'authEmails',
				},
			}),
		passwordResetNotPassProvider: async ({ email }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Reset SampleKit password',
					header: 'Reset your password',
					body: "A password reset was attempted, but this account is linked with Google. If you'd like to disconnect with Google and use a password, please sign in with Google and use the 'unlink' button.",
					button_text: 'Log in with Google',
					href: `${PUBLIC_ORIGIN}/login`,
					templateId: 'authEmails',
				},
			}),
		//#endregion fail
		//#region success
		passwordChanged: async ({ email }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Password Change Confirmation',
					header: 'Password Change Confirmation',
					body: `Your password was successfully changed at ${new Date().toUTCString()}`,
					button_text: 'Sign In',
					href: `${PUBLIC_ORIGIN}/login`,
					templateId: 'authEmails',
				},
			}),
		providerMethodChanged: async ({ email, newProvider }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Your login method has changed',
					header: `Now using ${newProvider.kind === 'oauth' ? 'OAuth' : 'Password'}`,
					body: `Your login method is now ${newProvider.kind === 'oauth' ? 'OAuth' : 'password'}. If you didn't request this change, please contact us immediately.`,
					button_text: 'Login',
					href: `${PUBLIC_ORIGIN}/login`,
					templateId: 'authEmails',
				},
			}),
		MFAChanged: async ({ editKind, email, mfaLabel }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'MFA Updated',
					header: `MFA ${editKind} successfully`,
					body: `Your ${mfaLabel} MFA was ${editKind} successfully at ${new Date().toUTCString()}.`,
					button_text: 'Sign In',
					href: `${PUBLIC_ORIGIN}/login`,
					templateId: 'authEmails',
				},
			}),
		accountDeleted: async ({ email }) =>
			send({
				to: email,
				dynamicTemplateData: {
					subject: 'Account Permanently Deleted',
					header: 'Your account has been permanently deleted',
					body: "We're sorry to see you go. If you'd like to sign up again, please use the button below.",
					button_text: 'Login',
					href: `${PUBLIC_ORIGIN}/signup`,
					templateId: 'authEmails',
				},
			}),
		//#endregion success
	},
};
