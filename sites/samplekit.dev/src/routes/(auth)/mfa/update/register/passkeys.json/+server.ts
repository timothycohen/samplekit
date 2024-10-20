import { mfaLabels } from '$lib/auth/common';
import { auth } from '$lib/auth/server';
import { checkedRedirect, jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { transports } from '$lib/transport/server';
import {
	registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema,
	type RegisterMFA_Passkey_WithSeshConfAndPasskeyRes,
} from '.';
import type { RequestHandler } from '@sveltejs/kit';

const registerMFA_Passkey_WithSeshConfAndPasskey: RequestHandler = async ({ request, locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');

	const body = await parseReqJson(request, registerMFA_Passkey_WithSeshConfAndPasskeyReqSchema);
	if (!body.success) return jsonFail(400);
	const clientRegResponse = body.data.passkeyData;

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
		transports.email.send.MFAChanged({
			editKind: 'added',
			email: seshUser.user.email,
			mfaLabel: mfaLabels['passkeys'],
		}),
	]);

	return jsonOk<RegisterMFA_Passkey_WithSeshConfAndPasskeyRes>({ message: 'Success' });
};

export const POST = registerMFA_Passkey_WithSeshConfAndPasskey;
