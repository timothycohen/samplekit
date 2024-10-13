import { auth } from '$lib/auth/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import type { PostReq } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const seshConfFromPasskey: RequestHandler = async ({ request, locals }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();
	const userId = user.id;

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
		auth.session.addTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
	]);

	return jsonOk();
};

export const POST = seshConfFromPasskey;
