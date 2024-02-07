import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth/server';
import { sanitizeRedirectUrl } from '$lib/http/server';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const seshConfFromEmailVeri = async ({ params, url, locals }: RequestEvent<{ token: string }>): Promise<Response> => {
	const { session } = await locals.seshHandler.userOrRedirect();
	const { token } = params;

	const { tokenErr } = await auth.token.emailVeri.validate({ token });
	if (tokenErr) return redirect(302, '/invalid-token');

	await auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache());

	const sanitizedPath = sanitizeRedirectUrl(url.searchParams.get('next'));
	if (sanitizedPath) return redirect(302, sanitizedPath);

	return redirect(302, '/account/profile');
};

export const GET: RequestHandler = seshConfFromEmailVeri;
