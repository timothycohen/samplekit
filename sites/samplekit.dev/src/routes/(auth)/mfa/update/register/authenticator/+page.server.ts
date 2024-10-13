import { mfaLabels } from '$lib/auth/common';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { verifyOTPSchema } from '$routes/(auth)/validators';
import type { Action } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();

	const [verifyAuthenticatorTokenForm, { secret }] = await Promise.all([
		superValidate(zod(verifyOTPSchema), { id: 'verifyAuthenticatorTokenForm_/mfa/update/register/authenticator' }),
		auth.token.setupAuthenticator.createOrRefresh({ userId: user.id }),
	]);

	const { dataUrl, key } = await auth.provider.pass.MFA.authenticator.generateClientSetupDetails({
		email: user.email,
		secret,
	});

	return {
		authenticator: {
			verifyAuthenticatorTokenForm,
			dataUrl,
			account: user.email,
			key,
		},
	};
};

const registerMFA_Authenticator_WithSeshConf: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const verifyAuthenticatorTokenForm = await superValidate(request, zod(verifyOTPSchema));
	if (!verifyAuthenticatorTokenForm.valid)
		return message(verifyAuthenticatorTokenForm, { fail: 'Invalid digits' }, { status: 400 });
	const token = Object.values(verifyAuthenticatorTokenForm.data).join('');

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null)
		return message(verifyAuthenticatorTokenForm, { fail: 'Verification expired' }, { status: 400 });

	const { tokenErr, secret } = await auth.token.setupAuthenticator.validate({ token, userId: user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, verifyAuthenticatorTokenForm);

	await Promise.all([
		auth.provider.pass.MFA.enable({ userId: user.id, authenticator: secret }),
		auth.session.deleteOthers({ userId: user.id, sessionId: session.id }),
		auth.session.removeTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
		transports.sendEmail.MFAUpdate({ editKind: 'added', email: user.email, mfaLabel: mfaLabels['authenticator'] }),
	]);

	return checkedRedirect(`/account/security/auth`);
};

export const actions = { registerMFA_Authenticator_WithSeshConf };
