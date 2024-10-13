import { fail as formFail, redirect, type Action } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { checkedRedirect, sanitizeRedirectUrl } from '$lib/http/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { confirmPassSchema, verifyOTPSchema } from '$routes/(auth)/validators';

const seshConfLimiter = createLimiter({
	id: 'seshConfFromPassword',
	limiters: [
		{ kind: 'ipUa', rate: [5, '30m'] },
		{ kind: 'userId', rate: [5, '30m'] },
	],
});

const seshConfFromPassword: Action = async (event) => {
	const { request, locals } = event;
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const confirmPassForm = await superValidate(request, zod(confirmPassSchema));
	if (!confirmPassForm.valid) return formFail(400, { confirmPassForm });
	const sanitizedPath = sanitizeRedirectUrl(confirmPassForm.data.redirect_path);

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	if (authDetails.method !== 'pass') return checkedRedirect('/account/security/auth');
	if (authDetails.mfaCount > 0)
		return message(confirmPassForm, { fail: 'Please authenticate with MFA.' }, { status: 403 });

	const rateCheck = await seshConfLimiter.check(event);
	if (rateCheck.forbidden) return formFail(403, { fail: 'Forbidden.' });
	if (rateCheck.limited)
		return message(confirmPassForm, { fail: rateCheck.humanTryAfter('requests') }, { status: 429 });

	const provider = await auth.provider.pass.email.get({ email: user.email, pass: confirmPassForm.data.password });
	if (!provider)
		return message(confirmPassForm, { fail: `Invalid password. ${rateCheck.humanAttemptsRemaining}` }, { status: 403 });

	await Promise.all([
		auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
		seshConfLimiter.clear(event),
	]);

	if (sanitizedPath) return redirect(302, sanitizedPath);
};

const seshConfFromSMS: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const verifySMSTokenForm = await superValidate(request, zod(verifyOTPSchema));
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

	const verifyAuthenticatorTokenForm = await superValidate(request, zod(verifyOTPSchema));
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

export const actions = { seshConfFromPassword, seshConfFromSMS, seshConfFromAuthenticator };
