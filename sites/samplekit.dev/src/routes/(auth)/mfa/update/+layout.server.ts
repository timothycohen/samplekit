import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { pluralize } from '$lib/utils/common';
import { confirmPassSchema, sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/validators';
import { desiredParamsOrRedirect } from './utils';
import type { VerifierProps } from '$routes/(auth)/components';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	const kind = authDetails.mfaCount
		? ('Identity' as const)
		: authDetails.method === 'oauth'
			? ('Email' as const)
			: ('Password' as const);
	if (authDetails.method !== 'pass') return redirect(302, '/account/security/auth');

	const timeRemaining = auth.session.getTempConf({ session });
	const verified = !!timeRemaining;

	const { desiredMFA, action } = desiredParamsOrRedirect({
		nextParam: url.searchParams.get('next'),
		path: url.pathname,
		verified,
	});

	const redirectPath = `/mfa/update/${action}/${desiredMFA}`;

	let expirationMsg = '';
	if (timeRemaining) expirationMsg = `Verification expires in ${timeRemaining} ${pluralize('minute', timeRemaining)}`;

	const confirmPassForm = await superValidate(confirmPassSchema, { id: 'confirmPassForm_/mfa/update(layout)' });
	confirmPassForm.data.redirect_path = redirectPath;

	const phoneNumberLast4 = authDetails.mfas.sms?.slice(-4);
	const [sendSMSTokenForm, verifySMSTokenForm, verifyAuthenticatorTokenForm] = await Promise.all([
		superValidate(sendSMSTokenSchema, { id: 'sendSMSTokenForm_/mfa/update(layout)' }),
		superValidate(verifyOTPSchema, { id: 'verifySMSTokenForm_/mfa/update(layout)' }),
		superValidate(verifyOTPSchema, { id: 'verifyAuthenticatorTokenForm_/mfa/update(layout)' }),
	]);

	verifySMSTokenForm.data.redirect_path = redirectPath;

	const veri: VerifierProps = {
		email: user.email,
		next: `/register-${desiredMFA}`,
		verified,
		kind,
		expirationMsg,
		pass: { confirmPassForm },
		mfa: {
			mfaCount: authDetails.mfaCount,
			mfasEnabled: authDetails.mfasEnabled,
			sms: { phoneNumberLast4, sendSMSTokenForm, verifyOTPForm: verifySMSTokenForm },
			authenticator: { verifyOTPForm: verifyAuthenticatorTokenForm },
		},
	};

	return {
		veri,
		desiredMFA,
		action,
	};
};
