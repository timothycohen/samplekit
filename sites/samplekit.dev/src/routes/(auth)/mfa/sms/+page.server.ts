import { error, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { checkedRedirect, sanitizeRedirectUrl } from '$lib/http/server';
import { sendSMSTokenSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
	error(404);
};

const smsVeriLimiter = createLimiter({
	id: 'sendSMSVeri',
	limiters: [
		{ kind: 'ipUa', rate: [10, '2h'] },
		{ kind: 'userId', rate: [10, '2h'] },
	],
});

const sendSMSVeri: Action = async (event) => {
	const { locals, request } = event;
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/email-verification');

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

	const rateCheck = await smsVeriLimiter.check(event, { log: { userId: seshUser.user.id } });
	if (rateCheck.forbidden) {
		return message(sendSMSTokenForm, { fail: 'Forbidden.' }, { status: 403 });
	}
	if (rateCheck.limited) {
		return message(
			sendSMSTokenForm,
			{ fail: `Please wait ${rateCheck.humanTryAfter} and try again.` },
			{ status: 429 },
		);
	}

	const { transportErr } = await transports.sms.send.Otp({ phoneNumber, otp });
	if (transportErr) {
		return message(sendSMSTokenForm, { fail: 'Sorry, we are unable to send MFA SMS at this time.' }, { status: 500 });
	}

	const sanitizedPath = sanitizeRedirectUrl(sendSMSTokenForm.data.redirect_path);
	if (sanitizedPath) return redirect(302, sanitizedPath);
	else return message(sendSMSTokenForm, { success: 'Text Resent!' });
};

export const actions: Actions = { sendSMSVeri };
