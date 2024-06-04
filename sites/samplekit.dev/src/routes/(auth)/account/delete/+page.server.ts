import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { deleteS3Object, invalidateCloudfront, keyController } from '$lib/cloudStorage/server';
import { checkedRedirect } from '$lib/http/server';
import { superValidate, zod } from '$lib/superforms/server';
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

	const confirmPassForm = await superValidate(zod(confirmPassSchema), { id: 'confirmPassForm_/account/delete' });
	confirmPassForm.data.redirect_path = redirectPath;

	const phoneNumberLast4 = authDetails.mfas.sms?.slice(-4);
	const [sendSMSTokenForm, verifySMSTokenForm, verifyAuthenticatorTokenForm] = await Promise.all([
		superValidate(zod(sendSMSTokenSchema), { id: 'sendSMSTokenForm_/account/delete' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifySMSTokenForm_/account/delete' }),
		superValidate(zod(verifyOTPSchema), { id: 'verifyAuthenticatorTokenForm_/account/delete' }),
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

	const meta: App.PageData['meta'] = { title: 'Delete Account | SampleKit' };

	return { veri, meta };
};

const deleteUserWithSeshConf: Action = async ({ locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null) return checkedRedirect('/account/delete');

	if (keyController.is.cloudfrontUrl(user.avatar?.url)) {
		const key = keyController.transform.cloudfrontUrlToKey(user.avatar.url);
		await Promise.all([
			deleteS3Object({ key, guard: () => keyController.guard.root({ key }) }),
			invalidateCloudfront({ keys: [key] }),
		]);
	}

	await Promise.all([auth.user.delete({ userId: user.id }), transports.sendEmail.delete({ email: user.email })]);

	locals.seshHandler.set({ session: null });

	return checkedRedirect('/');
};

export const actions: Actions = { deleteUserWithSeshConf };
