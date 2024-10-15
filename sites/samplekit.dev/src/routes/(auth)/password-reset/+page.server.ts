import { error, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { turnstileFormInputName } from '$lib/botProtection/turnstile/common';
import { validateTurnstile } from '$lib/botProtection/turnstile/server';
import { createLimiter } from '$lib/rate-limit/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { emailPassResetSchema } from '$routes/(auth)/validators';

export const load = async () => {
	error(404);
};

const resetPassLimiter = createLimiter({ id: 'emailPassReset', limiters: [{ kind: 'ipUa', rate: [3, '6h'] }] });

const emailPassReset: Action = async (event) => {
	const { request } = event;
	const formData = await request.formData();
	const clientToken = formData.get(turnstileFormInputName);
	const emailPassResetForm = await superValidate(formData, zod(emailPassResetSchema));

	if (!emailPassResetForm.valid) return message(emailPassResetForm, { fail: 'Invalid email' });
	if (clientToken === null || typeof clientToken !== 'string') {
		return message(
			emailPassResetForm,
			{ fail: `We've detected unusual traffic. Please refresh and try again.` },
			{ status: 403 },
		);
	}

	const turnstileValidation = await validateTurnstile({
		clientToken,
		ip: request.headers.get('CF-Connecting-IP'),
	});
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

export const actions = { emailPassReset };
