import { fail as formFail, redirect, type Action } from '@sveltejs/kit';
import { mfaLabels } from '$lib/auth/common';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { phoneNumberSchema, verifyOTPSchema } from '$routes/(auth)';

export const load = async ({ url }) => {
	const phoneNumber = url.searchParams.get('phone');
	const [phoneNumberForm, sanitizedPhone, verifySMSTokenForm] = await Promise.all([
		superValidate(zod(phoneNumberSchema), { id: 'phoneNumberForm_/mfa/update/register/sms' }),
		transports.sms.lookupPhoneNumber(phoneNumber ?? ''),
		superValidate(zod(verifyOTPSchema), { id: 'verifySMSTokenForm_/mfa/update/register/sms' }),
	]);

	if (sanitizedPhone) phoneNumberForm.data.phone_number = sanitizedPhone;

	verifySMSTokenForm.data.redirect_path = `/account/security/auth`;

	return {
		sms: {
			phoneNumberForm,
			sanitizedPhone,
			verifySMSTokenForm,
		},
	};
};

const SMSSetupFromSeshConf: Action = async ({ request, locals, url }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const phoneNumberForm = await superValidate(request, zod(phoneNumberSchema));
	if (!phoneNumberForm.valid) return formFail(400, { phoneNumberForm });

	const sanitizedPhone = await transports.sms.lookupPhoneNumber(phoneNumberForm.data.phone_number);
	if (!sanitizedPhone) return message(phoneNumberForm, { fail: 'Invalid phone number' }, { status: 400 });

	const { tokenErr, otp } = await auth.token.setupSMSVeri.createOrUpdate({
		userId: user.id,
		phoneNumber: sanitizedPhone,
	});
	if (tokenErr) return auth.token.err.toMessage(tokenErr, phoneNumberForm);

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null) return message(phoneNumberForm, { fail: 'Verification expired' }, { status: 400 });

	const { transportErr } = await transports.sms.send.Otp({ phoneNumber: sanitizedPhone, otp });
	if (transportErr)
		return message(phoneNumberForm, { fail: 'Sorry, we are unable to send MFA SMS at this time.' }, { status: 500 });

	url.searchParams.delete('/SMSSetupFromSeshConf');
	url.searchParams.set('phone', sanitizedPhone);
	return redirect(302, url);
};

const registerMFA_SMS_WithSeshConfAndSetupSMS: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const verifySMSTokenForm = await superValidate(request, zod(verifyOTPSchema));
	if (!verifySMSTokenForm.valid) return message(verifySMSTokenForm, { fail: 'Invalid digits' }, { status: 400 });
	const smsToken = Object.values(verifySMSTokenForm.data).join('');

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null) return message(verifySMSTokenForm, { fail: 'Verification expired' }, { status: 400 });

	const { tokenErr, phoneNumber } = await auth.token.setupSMSVeri.validate({ token: smsToken, userId: user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, verifySMSTokenForm);

	await Promise.all([
		auth.provider.pass.MFA.enable({ userId: user.id, sms: phoneNumber }),
		auth.session.deleteOthers({ userId: user.id, sessionId: session.id }),
		auth.session.removeTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
		transports.email.send.MFAChanged({ editKind: 'added', email: user.email, mfaLabel: mfaLabels['sms'] }),
	]);

	return checkedRedirect(`/account/security/auth`);
};

export const actions = { SMSSetupFromSeshConf, registerMFA_SMS_WithSeshConfAndSetupSMS };
