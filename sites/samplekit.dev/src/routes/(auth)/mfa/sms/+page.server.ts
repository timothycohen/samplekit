import { error, redirect, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { checkedRedirect, sanitizeRedirectUrl } from '$lib/http/server';
import { createLimiter } from '$lib/rate-limit/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { sendSMSTokenSchema } from '$routes/(auth)';

export const load = () => {
	error(404, 'Not Found');
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
	if (seshUser.session.awaitingEmailVeri) return checkedRedirect('/signup/email-verification');

	const [sendSMSTokenForm, mfaDetails] = await Promise.all([
		superValidate(request, zod(sendSMSTokenSchema)),
		auth.provider.pass.MFA.getDetailsOrThrow(seshUser.user.id),
	]);
	if (mfaDetails.method === 'oauth') return message(sendSMSTokenForm, { fail: 'Forbidden.' }, { status: 403 });

	const phoneNumber = mfaDetails.mfas.sms;

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
		return message(sendSMSTokenForm, { fail: rateCheck.humanTryAfter('attempts') }, { status: 429 });
	}

	const { transportErr } = await transports.sms.send.Otp({ phoneNumber, otp });
	if (transportErr) {
		return message(sendSMSTokenForm, { fail: 'Sorry, we are unable to send MFA SMS at this time.' }, { status: 500 });
	}

	const sanitizedPath = sanitizeRedirectUrl(sendSMSTokenForm.data.redirect_path);
	if (sanitizedPath) return redirect(302, sanitizedPath);
	else return message(sendSMSTokenForm, { success: 'Text Resent!' });
};

export const actions = { sendSMSVeri };
