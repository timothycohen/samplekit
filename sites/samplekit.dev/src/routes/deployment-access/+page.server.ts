import { fail as formFail } from '@sveltejs/kit';
import { createLimiter } from '$lib/rate-limit/server';
import { deploymentAccessController } from './controller';

const signinLimiter = createLimiter({ id: 'deployment-access-signin', limiters: [{ kind: 'ipUa', rate: [5, '5m'] }] });

export const load = async ({ cookies }) => {
	return { deploymentAuth: await deploymentAccessController.countAuthenticatedSessions({ cookies }) };
};

const signin: App.CommonServerAction = async (event) => {
	const { request, cookies } = event;

	const rateCheck = await signinLimiter.check(event);
	if (rateCheck.forbidden) return formFail(403, { fail: 'Forbidden.' });
	if (rateCheck.limited) return formFail(429, { fail: rateCheck.humanTryAfter('requests') });

	const accessToken = (await request.formData()).get('password');
	if (typeof accessToken !== 'string')
		return formFail(400, { fail: `Missing token. ${rateCheck.humanAttemptsRemaining}` });

	const { success } = await deploymentAccessController.createSession({ accessToken, cookies });
	if (!success) return formFail(403, { fail: `Invalid token. ${rateCheck.humanAttemptsRemaining}` });

	signinLimiter.clear(event);
	return { success: 'true' };
};

const signout: App.CommonServerAction = async ({ cookies }) => {
	await deploymentAccessController.deleteSession({ cookies });
	return { success: 'true' };
};

const signoutAll: App.CommonServerAction = async ({ cookies }) => {
	await deploymentAccessController.deleteAllSessions({ cookies });
	return { success: 'true' };
};

export const actions = { signin, signout, signoutAll };
