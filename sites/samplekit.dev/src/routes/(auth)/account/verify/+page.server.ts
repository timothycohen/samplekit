import { fail as formFail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { sanitizeRedirectUrl } from '$lib/http/server';
import { confirmPassSchema, verifyOTPSchema } from '$routes/(auth)/validators';
import type { Actions } from './$types';
import type { Action } from '@sveltejs/kit';

const seshConfFromPassword: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const confirmPassForm = await superValidate(request, confirmPassSchema);
	if (!confirmPassForm.valid) return formFail(400, { confirmPassForm });
	const sanitizedPath = sanitizeRedirectUrl(confirmPassForm.data.redirect_path);

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	if (authDetails.method !== 'pass') return redirect(302, '/account/security/auth');
	if (authDetails.mfaCount > 0)
		return message(confirmPassForm, { fail: 'Please authenticate with MFA.' }, { status: 403 });

	const password = confirmPassForm.data.password;

	const provider = await auth.provider.pass.email.get({ email: user.email, pass: password });
	if (!provider) return message(confirmPassForm, { fail: 'Invalid password.' }, { status: 403 });

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	if (sanitizedPath) return redirect(302, sanitizedPath);
};

const seshConfFromSMS: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const verifySMSTokenForm = await superValidate(request, verifyOTPSchema);
	if (!verifySMSTokenForm.valid) return message(verifySMSTokenForm, { fail: 'Invalid digits' }, { status: 400 });

	const tokens = Object.values(verifySMSTokenForm.data);
	const sanitizedPath = sanitizeRedirectUrl(tokens.pop() as string | undefined);
	const token = tokens.join('');

	const { tokenErr } = await auth.token.smsVeri.validate({ token, userId: user.id });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, verifySMSTokenForm);

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	if (sanitizedPath) return redirect(302, sanitizedPath);
};

const seshConfFromAuthenticator: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const verifyAuthenticatorTokenForm = await superValidate(request, verifyOTPSchema);
	if (!verifyAuthenticatorTokenForm.valid)
		return message(verifyAuthenticatorTokenForm, { fail: 'Invalid digits' }, { status: 400 });

	const tokens = Object.values(verifyAuthenticatorTokenForm.data);
	const sanitizedPath = sanitizeRedirectUrl(tokens.pop() as string | undefined);
	const token = tokens.join('');

	const { valid } = await auth.token.authenticator.isValid({ token, userId: user.id });
	if (!valid) return message(verifyAuthenticatorTokenForm, { fail: 'Invalid authenticator code.' }, { status: 403 });

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	if (sanitizedPath) return redirect(302, sanitizedPath);
};

// prettier-ignore
export const actions: Actions = { seshConfFromPassword, seshConfFromSMS, seshConfFromAuthenticator };
