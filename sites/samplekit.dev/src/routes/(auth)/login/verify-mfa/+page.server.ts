import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/validators';
import type { Action } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');
	if (!seshUser.session.awaitingMFA) return checkedRedirect('/account/profile');

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(seshUser.user.id);
	if (authDetails.method !== 'pass') return checkedRedirect('/account/security/auth');
	if (!authDetails.mfaCount) return checkedRedirect('/account/security/auth');

	const phoneNumberLast4 = authDetails.mfas.sms?.slice(-4);
	const [sendSMSTokenForm, verifySMSTokenForm, verifyAuthenticatorTokenForm] = await Promise.all([
		superValidate(zod(sendSMSTokenSchema), { id: 'sendSMSTokenForm_/login/verify-mfa' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifySMSTokenForm_/login/verify-mfa' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifyAuthenticatorTokenForm_/login/verify-mfa' }),
	]);

	verifySMSTokenForm.data.redirect_path = '/account/profile';

	return {
		email: seshUser.user.email,
		mfasEnabled: authDetails.mfasEnabled,
		mfaCount: authDetails.mfaCount,
		sms: {
			phoneNumberLast4,
			sendSMSTokenForm,
			verifyOTPForm: verifySMSTokenForm,
		},
		authenticator: {
			verifyOTPForm: verifyAuthenticatorTokenForm,
		},
	};
};

const loginWithSMS: Action = async ({ request, locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');
	if (!seshUser.session.awaitingMFA) return checkedRedirect('/account/profile');

	const verifySMSTokenForm = await superValidate(request, zod(verifyOTPSchema));
	if (!verifySMSTokenForm.valid) return message(verifySMSTokenForm, { fail: 'Invalid digits' }, { status: 400 });
	const smsToken = Object.values(verifySMSTokenForm.data).join('');

	const { tokenErr } = await auth.token.smsVeri.validate({ token: smsToken, userId: seshUser.user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, verifySMSTokenForm);

	await auth.session.removeAwaitingMFA({ sessionId: seshUser.session.id });

	return checkedRedirect(`/account/profile`);
};

const loginWithAuthenticator: Action = async ({ request, locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');
	if (!seshUser.session.awaitingMFA) return checkedRedirect('/account/profile');

	const verifyAuthenticatorTokenForm = await superValidate(request, zod(verifyOTPSchema));
	if (!verifyAuthenticatorTokenForm.valid)
		return message(verifyAuthenticatorTokenForm, { fail: 'Invalid digits' }, { status: 400 });
	const token = Object.values(verifyAuthenticatorTokenForm.data).join('');

	const { valid } = await auth.token.authenticator.isValid({ token, userId: seshUser.user.id });
	if (!valid) return message(verifyAuthenticatorTokenForm, { fail: 'Invalid authenticator code.' }, { status: 403 });

	await auth.session.removeAwaitingMFA({ sessionId: seshUser.session.id });

	return checkedRedirect(`/account/profile`);
};

export const actions = { loginWithSMS, loginWithAuthenticator };
