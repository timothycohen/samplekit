import { fail as formFail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import platform from 'platform';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { createNewPassSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;
	const { tokenErr, userId } = await auth.token.pwReset.validate({ token: token, checkOnly: true });
	if (tokenErr) return redirect(302, '/invalid-token');
	const user = await auth.user.get({ userId });
	if (!user) return redirect(302, '/invalid-token');

	const createNewPassForm = await superValidate(createNewPassSchema, {
		id: 'createNewPassForm_/password-update/[token]',
	});
	createNewPassForm.data.persistent = true;

	return { createNewPassForm, email: user.email };
};

const createNewPassFromPwReset: Action<{ token: string }> = async ({ request, params, locals, getClientAddress }) => {
	const createNewPassForm = await superValidate(request, createNewPassSchema);
	if (!createNewPassForm.valid) {
		if (createNewPassForm.errors._errors) return formFail(403, { createNewPassForm: createNewPassForm }); // technically should be 400, but this way we can show an error without js
		return formFail(400, { createNewPassForm });
	}

	const { token } = params;
	const { tokenErr, userId } = await auth.token.pwReset.validate({ token });
	if (tokenErr) return auth.token.err.toMessage(tokenErr, createNewPassForm);

	const user = await auth.user.get({ userId });
	if (!user) return message(createNewPassForm, { fail: 'User not found' }, { status: 403 });

	const { email } = user;

	const [authDetails] = await Promise.all([
		auth.provider.pass.MFA.getDetailsOrThrow(userId),
		auth.session.deleteAll({ userId }),
	]);
	const awaitingMFA = !!authDetails.mfaCount;

	if (authDetails.method === 'oauth') {
		await Promise.all([
			auth.provider.changeToPass({ email, userId, password: createNewPassForm.data.password, provider: 'email' }),
			transports.sendEmail.changedProviderMethod({ email, newProvider: { kind: 'pass', provider: 'email' } }),
		]);
	} else {
		const promises = [
			auth.provider.pass.email.updatePass({ email, newPassword: createNewPassForm.data.password }),
			transports.sendEmail.passwordChanged({ email }),
		];
		if (!authDetails.emailVerified) promises.push(auth.provider.pass.email.verifyEmail({ userId }));
		await Promise.all(promises);
	}

	const pf = platform.parse(request.headers.get('user-agent') ?? undefined);
	const session = await auth.session.create(
		{ userId, awaitingMFA, awaitingEmailVeri: false, persistent: createNewPassForm.data.persistent },
		{ os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() },
	);
	locals.seshHandler.set({ session });

	if (awaitingMFA) return redirect(302, '/login/verify-mfa');

	return redirect(302, '/account/profile');
};

export const actions: Actions = { createNewPassFromPwReset };
