import { auth } from '$lib/auth/server';
import { checkedRedirect, jsonFail, jsonOk } from '$lib/http/server';
import type { GetPasskeyAuthOptsRes } from './common';
import type { RequestHandler } from '@sveltejs/kit';

const getPasskeyAuthOpts: RequestHandler = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	const mfaDetails = await auth.provider.pass.MFA.getDetailsOrThrow(seshUser.user.id);
	if (mfaDetails.method === 'oauth') return jsonFail(401);

	const savedPasskeys = mfaDetails.mfas.passkeys;
	const opts = await auth.provider.pass.MFA.passkey.createAuthOpts({ savedPasskeys });
	await auth.token.passkeyChallenge.createOrReplace({ userId: seshUser.user.id, challenge: opts.challenge });

	return jsonOk<GetPasskeyAuthOptsRes>({ opts });
};

export const GET = getPasskeyAuthOpts;
