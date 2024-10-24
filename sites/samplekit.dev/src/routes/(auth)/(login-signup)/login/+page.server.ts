import { fail as formFail, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { validateTurnstile } from '$lib/bot-protection/turnstile/server';
import { getDeviceInfo } from '$lib/device-info';
import { checkedRedirect } from '$lib/http/server';
import { createLimiter } from '$lib/rate-limit/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { emailPassResetSchema, signinSchema } from '$routes/(auth)';

const signinLimiter = createLimiter({ id: 'signinWithPassword', limiters: [{ kind: 'ipUa', rate: [5, '15m'] }] });
const resetPassLimiter = createLimiter({ id: 'emailPassReset', limiters: [{ kind: 'ipUa', rate: [3, '6h'] }] });

export const load = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (seshUser) {
		if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/signup/email-verification');
		if (seshUser.session.awaitingMFA) return checkedRedirect('/login/verify-mfa');
		return checkedRedirect('/account/profile');
	}

	const [signinForm, emailPassResetForm] = await Promise.all([
		superValidate(zod(signinSchema), { id: 'signinForm_/login' }),
		superValidate(zod(emailPassResetSchema), { id: 'emailPassResetForm_/login' }),
	]);

	signinForm.data.persistent = true;

	return { signinForm, emailPassResetForm };
};

const loginWithPassword: Action = async (event) => {
	const { request, locals, getClientAddress } = event;
	const formData = await request.formData().catch(() => new FormData());
	const signinForm = await superValidate(formData, zod(signinSchema));
	if (!signinForm.valid) return formFail(400, { signinForm });

	const turnstileValidation = await validateTurnstile({ formData, headers: request.headers });
	signinForm.data['turnstile-used'] = true;
	if (turnstileValidation.error) {
		signinForm.data.password = '';
		return message(
			signinForm,
			{ fail: `We've detected unusual traffic. Please refresh and try again.` },
			{ status: 403 },
		);
	}

	let sanitizedPath: '/account/profile' | '/signup/email-verification' | '/login/verify-mfa' = '/account/profile';

	const rateCheck = await signinLimiter.check(event);
	if (rateCheck.forbidden) return formFail(403, { fail: 'Forbidden.' });
	if (rateCheck.limited) return message(signinForm, { fail: rateCheck.humanTryAfter('requests') }, { status: 429 });

	const provider = await auth.provider.pass.email.get({
		email: signinForm.data.email,
		pass: signinForm.data.password,
	});
	if (!provider) {
		signinForm.data.password = '';
		return message(
			signinForm,
			{ fail: `Invalid email or password. ${rateCheck.humanAttemptsRemaining}` },
			{ status: 403 },
		);
	}

	await signinLimiter.clear(event);

	const awaitingMFA = auth.provider.pass.MFA.countMFAs(auth.provider.pass.MFA.calcMFAsEnabled(provider)) > 0;
	const awaitingEmailVeri = !provider.emailVerified;

	const session = await auth.session.create(
		{
			userId: provider.userId,
			awaitingMFA,
			awaitingEmailVeri,
			persistent: signinForm.data.persistent,
		},
		getDeviceInfo({ headers: request.headers, getClientAddress }),
	);

	locals.seshHandler.set({ session });

	if (session.awaitingEmailVeri) sanitizedPath = '/signup/email-verification';
	else if (session.awaitingMFA) sanitizedPath = '/login/verify-mfa';

	return checkedRedirect(sanitizedPath);
};

const emailPassReset: Action = async (event) => {
	const { request } = event;
	const formData = await request.formData().catch(() => new FormData());
	const emailPassResetForm = await superValidate(formData, zod(emailPassResetSchema));
	if (!emailPassResetForm.valid) return message(emailPassResetForm, { fail: 'Invalid email' });

	const turnstileValidation = await validateTurnstile({ formData, headers: request.headers });
	emailPassResetForm.data['turnstile-used'] = true;
	if (turnstileValidation.error) {
		return message(
			emailPassResetForm,
			{ fail: `We've detected unusual traffic. Please refresh and try again.` },
			{ status: 403 },
		);
	}

	const rateCheck = await resetPassLimiter.check(event, { log: { email: emailPassResetForm.data.email } });
	if (rateCheck.forbidden) {
		return message(emailPassResetForm, { fail: 'Forbidden.' }, { status: 403 });
	}
	if (rateCheck.limited) {
		return message(emailPassResetForm, { fail: rateCheck.humanTryAfter('requests') }, { status: 429 });
	}

	const storedUser = await auth.user.get({ email: emailPassResetForm.data.email });

	if (!storedUser) {
		const { transportErr } = await transports.email.send.passwordResetNoAccount({
			email: emailPassResetForm.data.email,
		});
		if (transportErr) {
			return message(emailPassResetForm, { fail: 'Sorry, we are unable to send email at this time.' }, { status: 500 });
		} else {
			return message(emailPassResetForm, { success: 'Sent' });
		}
	}

	const method = await auth.provider.getMethodOrThrow(storedUser.id);
	if (method === 'oauth') {
		await transports.email.send.passwordResetNotPassProvider({ email: storedUser.email });
		return message(emailPassResetForm, { success: 'Sent' });
	}

	const { tokenErr, token } = await auth.token.pwReset.createOrRefresh({ userId: storedUser.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, emailPassResetForm);

	const { transportErr } = await transports.email.send.passwordResetToken({ token, email: storedUser.email });
	if (transportErr)
		return message(emailPassResetForm, { fail: 'Sorry, we are unable to send email at this time.' }, { status: 500 });

	return message(emailPassResetForm, { success: 'Sent' });
};

export const actions = { loginWithPassword, emailPassReset };
