import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import type { PostReq } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const loginWithPasskey = async ({ request, locals }: RequestEvent) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	const userId = seshUser.user.id;

	const body = await (request.json() as Promise<PostReq>).catch(() => null);
	if (!body) return jsonFail(400);
	const clientAuthResponse = body.passkeyData;

	const [savedPasskeys, validated] = await Promise.all([
		auth.provider.pass.MFA.passkey.getSaved(userId),
		auth.token.passkeyChallenge.getChallenge({ userId }),
	]);
	const { tokenErr, challenge } = validated;
	if (tokenErr) return auth.token.err.toJsonFail(tokenErr);

	const verified = await auth.provider.pass.MFA.passkey.verifyClientAuth({
		expectedChallenge: challenge,
		clientAuthResponse,
		userId,
		savedPasskeys,
	});
	if (verified.error) return jsonFail(verified.error.status, verified.error.message);

	await Promise.all([
		auth.token.passkeyChallenge.delete({ userId }),
		auth.session.removeAwaitingMFA({ sessionId: seshUser.session.id }).then(() => locals.seshHandler.invalidateCache()),
	]);

	return jsonOk();
};

export const POST: RequestHandler = loginWithPasskey;
