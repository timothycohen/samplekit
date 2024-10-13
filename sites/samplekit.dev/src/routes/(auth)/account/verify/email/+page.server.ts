import { fail as formFail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { sanitizeRedirectUrl } from '$lib/http/server';

const sendEmailVeriToSeshConfEmailLink: App.CommonServerAction = async ({ locals, url }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const sanitizedPath = sanitizeRedirectUrl(url.searchParams.get('next'));

	const { tokenErr, token } = await auth.token.emailVeri.createOrRefresh({ userId: user.id });
	if (tokenErr) {
		const err = auth.token.err.toFormFail(tokenErr);
		if (sanitizedPath) return redirect(302, `${sanitizedPath}?fail=${err.data?.fail}`);
		return err;
	}

	const { transportErr } = await transports.sendEmail.veriToSeshConfEmail({
		token,
		email: user.email,
		redirectPath: '/account/delete',
	});
	if (transportErr) {
		const err = 'Sorry, we are unable to send this email.';
		if (sanitizedPath) return redirect(302, `${sanitizedPath}?fail=${err}`);
		return formFail(500, { fail: err });
	}

	if (sanitizedPath) return redirect(302, `${sanitizedPath}?success=Sent`);
	else return { success: 'Sent' };
};

export const actions = { sendEmailVeriToSeshConfEmailLink };
