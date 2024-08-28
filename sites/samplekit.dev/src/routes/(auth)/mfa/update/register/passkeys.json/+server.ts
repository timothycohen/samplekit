import { mfaLabels } from '$lib/auth/common';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { jsonFail, jsonOk } from '$lib/http/server';
import type { PostReq } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const registerMFA_Passkey_WithSeshConfAndPasskey = async ({ request, locals }: RequestEvent): Promise<Response> => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');

	const body = await (request.json() as Promise<PostReq>).catch(() => null);
	if (!body) return jsonFail(400);
	const clientRegResponse = body.passkeyData;

	const { tokenErr, challenge } = await auth.token.passkeyChallenge.getChallenge({ userId: seshUser.user.id });
	if (tokenErr) return auth.token.err.toJsonFail(tokenErr);

	const timeRemaining = auth.session.getTempConf({ session: seshUser.session });
	if (timeRemaining === null) return jsonFail(400, 'Verification expired');

	const registered = await auth.provider.pass.MFA.passkey.verifyClientReg({
		expectedChallenge: challenge,
		clientRegResponse,
		userId: seshUser.user.id,
	});
	if (registered.error) return jsonFail(registered.error.status, registered.error.message);

	await Promise.all([
		auth.provider.pass.MFA.enable({ userId: seshUser.user.id, passkeys: registered.data }),
		auth.session.deleteOthers({ userId: seshUser.user.id, sessionId: seshUser.session.id }),
		auth.session.removeTempConf({ sessionId: seshUser.session.id }).then(() => locals.seshHandler.invalidateCache()),
		auth.token.passkeyChallenge.delete({ userId: seshUser.user.id }),
		transports.sendEmail.MFAUpdate({ editKind: 'added', email: seshUser.user.email, mfaLabel: mfaLabels['passkeys'] }),
	]);

	return jsonOk();
};

export const POST: RequestHandler = registerMFA_Passkey_WithSeshConfAndPasskey;
