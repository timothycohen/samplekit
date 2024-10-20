import { fail as formFail, redirect, type Action, type RequestHandler } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { checkedRedirect, sanitizeRedirectUrl } from '$lib/http/server';
import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { createLimiter } from '$lib/rate-limit/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { transports } from '$lib/transport/server';
import { confirmPassSchema, verifyOTPSchema } from '$routes/(auth)/schemas';
import { seshConfFromPasskeyReqSchema, type SeshConfFromPasskeyRes } from './dtos.common';

const seshConfLimiter = createLimiter({
	id: 'seshConfFromPassword',
	limiters: [
		{ kind: 'ipUa', rate: [5, '30m'] },
		{ kind: 'userId', rate: [5, '30m'] },
	],
});

export const seshConfFromPassword: Action = async (event) => {
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

export const seshConfFromSMS: Action = async ({ request, locals }) => {
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

export const seshConfFromAuthenticator: Action = async ({ request, locals }) => {
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

export const sendSeshConfToken: App.CommonServerAction = async ({ locals, url }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const redirectPath = sanitizeRedirectUrl(url.searchParams.get('next'));
	if (!redirectPath) return formFail(400, { fail: 'Invalid redirect path' });

	const { tokenErr, token } = await auth.token.emailVeri.createOrRefresh({ userId: user.id });
	if (tokenErr) {
		const err = auth.token.err.toFormFail(tokenErr);
		return redirect(302, `${redirectPath}?fail=${err.data?.fail}`);
	}

	const { transportErr } = await transports.email.send.seshConfToken({
		token,
		email: user.email,
		redirectPath,
	});
	if (transportErr) {
		const err = 'Sorry, we are unable to send this email.';
		return redirect(302, `${redirectPath}?fail=${err}`);
	}

	return redirect(302, `${redirectPath}?success=Sent`);
};

export const seshConfFromEmailVeri: RequestHandler<{ token: string }> = async ({ params, url, locals }) => {
	const { session } = await locals.seshHandler.userOrRedirect();
	const { token } = params;

	const { tokenErr } = await auth.token.emailVeri.validate({ token });
	if (tokenErr) return checkedRedirect('/invalid-token');

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	const sanitizedPath = sanitizeRedirectUrl(url.searchParams.get('next'));
	if (sanitizedPath) return redirect(302, sanitizedPath);

	return checkedRedirect('/account/profile');
};

export const seshConfFromPasskey: RequestHandler = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();
	const userId = user.id;

	const body = await parseReqJson(request, seshConfFromPasskeyReqSchema);
	if (!body.success) return jsonFail(400);
	const clientAuthResponse = body.data.passkeyData;

	const [savedPasskeys, validated] = await Promise.all([
		auth.provider.pass.MFA.passkey.getSaved(userId),
		auth.token.passkeyChallenge.getChallenge({ userId }),
	]);
	const { tokenErr, challenge } = validated;
	if (tokenErr) return auth.token.err.toJsonFail(tokenErr);

	const verified = await auth.provider.pass.MFA.passkey.verifyClientAuth({
		expectedChallenge: challenge,
		clientAuthResponse,
		userId,
		savedPasskeys,
	});
	if (verified.error) return jsonFail(verified.error.status, verified.error.message);

	await Promise.all([
		auth.token.passkeyChallenge.delete({ userId }),
		auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
	]);

	return jsonOk<SeshConfFromPasskeyRes>({ message: 'Success' });
};
