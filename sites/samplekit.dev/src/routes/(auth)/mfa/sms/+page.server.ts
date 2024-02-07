import { error, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { sanitizeRedirectUrl } from '$lib/http/server';
import { sendSMSTokenSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
	error(404);
};

const sendSMSVeri: Action = async ({ locals, request }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	if (seshUser.session.awaitingEmailVeri) return redirect(302, '/email-verification');

	const [sendSMSTokenForm, { mfas }] = await Promise.all([
		superValidate(request, sendSMSTokenSchema),
		auth.provider.pass.MFA.getDetailsOrThrow(seshUser.user.id),
	]);
	const phoneNumber = mfas.sms;

	if (!phoneNumber) {
		return message(sendSMSTokenForm, { fail: 'You have not registered a phone number.' }, { status: 403 });
	}

	const { tokenErr, otp } = await auth.token.smsVeri.createOrRefresh({ userId: seshUser.user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, sendSMSTokenForm);

	const { transportErr } = await transports.sms.send.Otp({ phoneNumber, otp });
	if (transportErr) {
		return message(sendSMSTokenForm, { fail: 'Sorry, we are unable to send MFA SMS at this time.' }, { status: 500 });
	}

	const sanitizedPath = sanitizeRedirectUrl(sendSMSTokenForm.data.redirect_path);
	if (sanitizedPath) return redirect(302, sanitizedPath);
	else return message(sendSMSTokenForm, { success: 'Text Resent!' });
};

export const actions: Actions = { sendSMSVeri };
