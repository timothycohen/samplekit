import { fail as formFail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/auth/server';
import { updatePassSchema } from '$routes/(auth)/validators';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const [authDetails, updatePassForm] = await Promise.all([
		auth.provider.pass.MFA.getDetailsOrThrow(user.id),
		superValidate(updatePassSchema, { id: 'updatePassForm_/account/security/auth' }),
	]);

	return {
		method: authDetails.method,
		mfasEnabled: authDetails.mfasEnabled,
		mfaCount: authDetails.mfaCount,
		updatePassForm,
		email: user.email,
		phoneNumberLast4: authDetails.mfas.sms?.slice(-4),
	};
};

const updatePassFromCurrPass: Action = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const updatePassForm = await superValidate(request, updatePassSchema);
	if (!updatePassForm.valid) {
		if (updatePassForm.errors._errors) return formFail(403, { updatePassForm }); // technically should be 400, but this way we can show an error without js
		return formFail(400, { updatePassForm });
	}

	const provider = await auth.provider.pass.email.get({
		email: user.email,
		pass: updatePassForm.data.currentPassword,
	});

	if (!provider) {
		return message(updatePassForm, { fail: 'Invalid password.' }, { status: 403 });
	}

	await Promise.all([
		auth.session.deleteOthers({ sessionId: session.id, userId: user.id }),
		auth.provider.pass.email.updatePass({ email: user.email, newPassword: updatePassForm.data.password }),
	]);

	return message(updatePassForm, { success: 'Updated!' });
};

export const actions: Actions = { updatePassFromCurrPass };
