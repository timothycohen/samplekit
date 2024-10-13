import { redirect, type RequestHandler } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { checkedRedirect, sanitizeRedirectUrl } from '$lib/http/server';

const seshConfFromEmailVeri: RequestHandler<{ token: string }> = async ({ params, url, locals }) => {
	const { session } = await locals.seshHandler.userOrRedirect();
	const { token } = params;

	const { tokenErr } = await auth.token.emailVeri.validate({ token });
	if (tokenErr) return checkedRedirect('/invalid-token');

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	const sanitizedPath = sanitizeRedirectUrl(url.searchParams.get('next'));
	if (sanitizedPath) return redirect(302, sanitizedPath);

	return checkedRedirect('/account/profile');
};

export const GET = seshConfFromEmailVeri;
