import { fail as formFail } from '@sveltejs/kit';
import { createLimiter } from '$lib/botProtection/rateLimit/server';
import { deploymentAccessController } from './controller';
import type { Actions } from './$types';

const signinLimiter = createLimiter({ id: 'deployment-access-signin', limiters: [{ kind: 'ipUa', rate: [5, '5m'] }] });

export const load = async ({ cookies }) => {
	return { authorized: await deploymentAccessController.isAuthenticated({ cookies }) };
};

const signin: App.CommonServerAction = async (event) => {
	const { request, cookies } = event;

	const rateCheck = await signinLimiter.check(event);
	if (rateCheck.forbidden) {
		return formFail(403, { fail: 'Forbidden.' });
	}
	if (rateCheck.limited)
		return formFail(429, { fail: `Too many requests. Please try again in ${rateCheck.humanTryAfter}.` });

	const accessToken = (await request.formData()).get('password');
	if (typeof accessToken !== 'string')
		return formFail(400, { fail: `Missing token. ${rateCheck.attemptsRemaining} attempts remaining.` });

	const { success } = await deploymentAccessController.createSession({ accessToken, cookies });
	if (!success) return formFail(403, { fail: `Invalid token. ${rateCheck.attemptsRemaining} attempts remaining.` });

	signinLimiter.clear(event);
	return { success: 'true' };
};

const signout: App.CommonServerAction = async ({ cookies }) => {
	await deploymentAccessController.deleteSession({ cookies });

	return { success: 'true' };
};

export const actions: Actions = { signin, signout };
