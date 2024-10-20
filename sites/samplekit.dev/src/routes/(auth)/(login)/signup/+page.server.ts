import { fail as formFail, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { validateTurnstile } from '$lib/botProtection/turnstile/server';
import { getDeviceInfo } from '$lib/device-info';
import { checkedRedirect } from '$lib/http/server';
import { logger } from '$lib/logging/server';
import { createLimiter } from '$lib/rate-limit/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { signupSchema } from '$routes/(auth)/schemas';

const signupLimiter = createLimiter({ id: 'signupWithPassword', limiters: [{ kind: 'ipUa', rate: [3, 'd'] }] });

export const load = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (seshUser) {
		if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');
		if (seshUser.session.awaitingMFA) return checkedRedirect('/login/verify-mfa');
		return checkedRedirect('/account/profile');
	}

	const signupForm = await superValidate(zod(signupSchema), { id: 'signupForm_/signup' });
	signupForm.data.persistent = true;

	return { signupForm, layout: { showFooter: false, showHeader: false } };
};

const signupWithPassword: Action = async (event) => {
	const { request, locals, getClientAddress } = event;
	const formData = await request.formData();
	const signupForm = await superValidate(formData, zod(signupSchema));
	if (!signupForm.valid) return formFail(400, { signupForm });

	const turnstileValidation = await validateTurnstile({ formData, headers: request.headers });
	signupForm.data['turnstile-used'] = true;
	if (turnstileValidation.error) {
		signupForm.data.password = '';
		return message(
			signupForm,
			{ fail: `We've detected unusual traffic. Please refresh and try again.` },
			{ status: 403 },
		);
	}

	const { user, error } = await auth.user.createEmailPass({
		email: signupForm.data.email,
		givenName: signupForm.data.given_name,
		familyName: signupForm.data.family_name,
		rawPassword: signupForm.data.password,
	});

	if (error) {
		signupForm.data.password = '';
		return message(signupForm, { fail: 'Account taken.' }, { status: 403 });
	}

	const rateCheck = await signupLimiter.check(event, { log: { email: signupForm.data.email } });
	if (rateCheck.forbidden) {
		signupForm.data.password = '';
		return message(signupForm, { fail: `Forbidden` }, { status: 403 });
	}
	if (rateCheck.limited) {
		signupForm.data.password = '';
		return message(signupForm, { fail: rateCheck.humanTryAfter('new accounts') }, { status: 429 });
	}

	const session = await auth.session.create(
		{
			userId: user.id,
			awaitingMFA: false,
			awaitingEmailVeri: true,
			persistent: signupForm.data.persistent,
		},
		getDeviceInfo({ headers: request.headers, getClientAddress }),
	);
	locals.seshHandler.set({ session });

	const { tokenErr, token } = await auth.token.emailVeri.createOrRefresh({ userId: user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, signupForm);
	const { transportErr } = await transports.email.send.emailVeriToken({ token, email: user.email });
	if (transportErr) {
		logger.error('Unable to send email verification email. Sending user to email-verification page with resend link.');
	}

	return checkedRedirect('/email-verification');
};

export const actions = { signupWithPassword };
