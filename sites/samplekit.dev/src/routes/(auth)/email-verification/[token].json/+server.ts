import platform from 'platform';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import type { RequestHandler } from '@sveltejs/kit';

const verifyEmailWithEmailVeri: RequestHandler<{ token: string }> = async ({
	params,
	locals,
	request,
	getClientAddress,
}) => {
	const { token } = params;

	const { tokenErr, userId } = await auth.token.emailVeri.validate({ token });
	if (tokenErr) return checkedRedirect('/invalid-token');

	const res = await locals.seshHandler.getSessionUser();

	const pf = platform.parse(request.headers.get('user-agent') ?? undefined);

	const [session] = await Promise.all([
		auth.session.deleteAll({ userId }).then(() =>
			auth.session.create(
				{
					userId,
					// SAFETY: Assumes that the user cannot set up MFA until they verify their email
					awaitingMFA: false,
					awaitingEmailVeri: false,
					persistent: res?.session.persistent ?? false,
				},
				{ os: pf.os?.family ?? null, browser: pf.name ?? null, ip: getClientAddress() },
			),
		),
		auth.provider.pass.email.verifyEmail({ userId }),
	]);

	locals.seshHandler.set({ session });
	return checkedRedirect('/account/profile');
};

export const GET = verifyEmailWithEmailVeri;
