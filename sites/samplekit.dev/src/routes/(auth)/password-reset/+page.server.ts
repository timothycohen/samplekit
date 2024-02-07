import { error } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { turnstileFormInputName } from '$lib/botProtection/turnstile/common';
import { validateTurnstile } from '$lib/botProtection/turnstile/server';
import { emailPassResetSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	error(404);
};

const emailPassReset: Action = async ({ request }) => {
	const formData = await request.formData();
	const clientToken = formData.get(turnstileFormInputName);
	const emailPassResetForm = await superValidate(formData, emailPassResetSchema);

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

	const storedUser = await auth.user.get({ email: emailPassResetForm.data.email });

	if (!storedUser) {
		const { transportErr } = await transports.sendEmail.passwordResetNotFound({
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
		await transports.sendEmail.noResetWithGoogle({ email: storedUser.email });
		return message(emailPassResetForm, { success: 'Sent' });
	}

	const { tokenErr, token } = await auth.token.pwReset.createOrRefresh({ userId: storedUser.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, emailPassResetForm);

	const { transportErr } = await transports.sendEmail.passwordReset({ token, email: storedUser.email });
	if (transportErr)
		return message(emailPassResetForm, { fail: 'Sorry, we are unable to send email at this time.' }, { status: 500 });

	return message(emailPassResetForm, { success: 'Sent' });
};

export const actions: Actions = { emailPassReset };
