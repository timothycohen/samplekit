import { fail as formFail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	if (!seshUser.session.awaitingEmailVeri) return redirect(302, '/account/profile');

	return { unverifiedEmail: seshUser.user.email };
};

const resendEmailVeriToVerifyEmailLink: App.CommonServerAction = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return redirect(302, '/login');
	if (!seshUser.session.awaitingEmailVeri) return redirect(302, '/account/profile');

	const { tokenErr, token } = await auth.token.emailVeri.createOrRefresh({ userId: seshUser.user.id });
	if (tokenErr) return auth.token.err.toFormFail(tokenErr);

	const { transportErr } = await transports.sendEmail.verification({ token, email: seshUser.user.email });
	if (transportErr) return formFail(500, { fail: 'Sorry, we are unable to send this email.' });
	return { success: 'Sent' };
};

export const actions: Actions = { resendEmailVeriToVerifyEmailLink };
