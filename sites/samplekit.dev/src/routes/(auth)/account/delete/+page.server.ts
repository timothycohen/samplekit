import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { CLOUDFRONT_URL } from '$env/static/private';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { deleteS3Object, invalidateCloudfront, urlTransforms } from '$lib/cloudStorage/server';
import { pluralize } from '$lib/utils/common';
import { confirmPassSchema, sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/validators';
import type { VerifierProps } from '$routes/(auth)/components';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	const kind = authDetails.mfaCount
		? ('Identity' as const)
		: authDetails.method === 'oauth'
			? ('Email' as const)
			: ('Password' as const);

	const redirectPath = `/account/delete`;

	const timeRemaining = auth.session.getTempConf({ session });
	const verified = !!timeRemaining;
	let expirationMsg = '';
	if (timeRemaining) expirationMsg = `Verification expires in ${timeRemaining} ${pluralize('minute', timeRemaining)}`;

	const confirmPassForm = await superValidate(confirmPassSchema, { id: 'confirmPassForm_/account/delete' });
	confirmPassForm.data.redirect_path = redirectPath;

	const phoneNumberLast4 = authDetails.mfas.sms?.slice(-4);
	const [sendSMSTokenForm, verifySMSTokenForm, verifyAuthenticatorTokenForm] = await Promise.all([
		superValidate(sendSMSTokenSchema, { id: 'sendSMSTokenForm_/account/delete' }),
		superValidate(verifyOTPSchema, { id: 'verifySMSTokenForm_/account/delete' }),
		superValidate(verifyOTPSchema, { id: 'verifyAuthenticatorTokenForm_/account/delete' }),
	]);

	verifySMSTokenForm.data.redirect_path = redirectPath;

	const veri: VerifierProps = {
		next: '/account/delete',
		email: user.email,
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

	return { veri };
};

const deleteUserWithSeshConf: Action = async ({ locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null) return redirect(302, '/account/delete');

	if (user.avatar?.url.startsWith(CLOUDFRONT_URL)) {
		const key = urlTransforms.cloudfrontUrlToKey(user.avatar.url);
		await Promise.all([deleteS3Object({ key }), invalidateCloudfront({ keys: [key] })]);
	}

	await Promise.all([auth.user.delete({ userId: user.id }), transports.sendEmail.delete({ email: user.email })]);

	locals.seshHandler.set({ session: null });

	return redirect(302, '/');
};

export const actions: Actions = { deleteUserWithSeshConf };
