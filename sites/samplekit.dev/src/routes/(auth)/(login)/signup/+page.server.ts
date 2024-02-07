import { fail as formFail } from '@sveltejs/kit';
import platform from 'platform';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { createDeviceLimiter } from '$lib/botProtection/rateLimit/server';
import { turnstileFormInputName } from '$lib/botProtection/turnstile/common';
import { validateTurnstile } from '$lib/botProtection/turnstile/server';
import { checkedRedirect } from '$lib/http/server';
import { logger } from '$lib/logging/server';
import { signupSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

const signupLimiter = createDeviceLimiter({ id: 'signupWithPassword', rate: [3, 'd'] });

export const load: PageServerLoad = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (seshUser) {
		if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');
		if (seshUser.session.awaitingMFA) return checkedRedirect('/login/verify-mfa');
		return checkedRedirect('/account/profile');
	}

	const signupForm = await superValidate(signupSchema, { id: 'signupForm_/signup' });
	signupForm.data.persistent = true;

	return { signupForm, layout: { showFooter: false, showHeader: false } };
};

const signupWithPassword: Action = async (event) => {
	const { request, locals, getClientAddress } = event;
	const formData = await request.formData();
	const clientToken = formData.get(turnstileFormInputName);
	const signupForm = await superValidate(formData, signupSchema);

	if (!signupForm.valid) return formFail(400, { signupForm });
	if (clientToken === null || typeof clientToken !== 'string') return formFail(400, { signupForm });

	const turnstileValidation = await validateTurnstile({
		clientToken,
		ip: request.headers.get('CF-Connecting-IP'),
	});
	signupForm.data['turnstile-used'] = true;
	if (turnstileValidation.error) {
		signupForm.data.password = '';
		return message(
			signupForm,
			{ fail: `We've detected unusual traffic. Please refresh and try again.` },
			{ status: 403 },
		);
	}

	const rateCheck = await signupLimiter.check(event, { log: { email: signupForm.data.email } });
	if (rateCheck.limited) {
		signupForm.data.password = '';
		return message(
			signupForm,
			{ fail: `Too many new accounts. Please wait ${rateCheck.humanTryAfter} and try again.` },
			{ status: 429 },
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

	const pf = platform.parse(request.headers.get('user-agent') ?? undefined);
	const session = await auth.session.create(
		{
			userId: user.id,
			awaitingMFA: false,
			awaitingEmailVeri: true,
			persistent: signupForm.data.persistent,
		},
		{ os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() },
	);
	locals.seshHandler.set({ session });

	const { tokenErr, token } = await auth.token.emailVeri.createOrRefresh({ userId: user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, signupForm);
	const { transportErr } = await transports.sendEmail.verification({ token, email: user.email });
	if (transportErr) {
		logger.error('Unable to send email verification email. Sending user to email-verification page with resend link.');
	}

	return checkedRedirect('/email-verification');
};

export const actions: Actions = { signupWithPassword };
