import { fail as formFail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	if ((await auth.provider.getMethodOrThrow(seshUser.user.id)) === 'pass') return redirect(302, '/account/profile');
};

const changeToEmailPassProvider: App.CommonServerAction = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();

	const { tokenErr, token } = await auth.token.pwReset.createOrRefresh({ userId: user.id });
	if (tokenErr) return auth.token.err.toFormFail(tokenErr);
	const { transportErr } = await transports.sendEmail.passwordReset({ token, email: user.email });
	if (transportErr) return formFail(500, { fail: 'Sorry, we are unable to send email at this time.' });

	return { success: 'Password setup email sent.' };
};

export const actions: Actions = { changeToEmailPassProvider };
