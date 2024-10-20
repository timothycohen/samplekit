import { fail as formFail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { sanitizeRedirectUrl } from '$lib/http/server';
import { transports } from '$lib/transport/server';

const sendSeshConfToken: App.CommonServerAction = async ({ locals, url }) => {
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

export const actions = { sendSeshConfToken };
