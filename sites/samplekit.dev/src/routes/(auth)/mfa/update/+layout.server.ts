import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { superValidate, zod } from '$lib/superforms/server';
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
	if (authDetails.method !== 'pass') return checkedRedirect('/account/security/auth');

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

	const confirmPassForm = await superValidate(zod(confirmPassSchema), { id: 'confirmPassForm_/mfa/update(layout)' });
	confirmPassForm.data.redirect_path = redirectPath;

	const phoneNumberLast4 = authDetails.mfas.sms?.slice(-4);
	const [sendSMSTokenForm, verifySMSTokenForm, verifyAuthenticatorTokenForm] = await Promise.all([
		superValidate(zod(sendSMSTokenSchema), { id: 'sendSMSTokenForm_/mfa/update(layout)' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifySMSTokenForm_/mfa/update(layout)' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifyAuthenticatorTokenForm_/mfa/update(layout)' }),
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

	const meta: App.PageData['meta'] = { title: 'Update MFA | SampleKit' };

	return {
		veri,
		desiredMFA,
		action,
		meta,
	};
};
