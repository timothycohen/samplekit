import { auth } from '$lib/auth/server';
import { checkedRedirect, jsonOk } from '$lib/http/server';
import type { GetRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const getPasskeyAuthOpts: RequestHandler = async ({ locals }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');

	const savedPasskeys = await auth.provider.pass.MFA.passkey.getSaved(seshUser.user.id);
	const opts = await auth.provider.pass.MFA.passkey.createAuthOpts({ savedPasskeys });
	await auth.token.passkeyChallenge.createOrReplace({ userId: seshUser.user.id, challenge: opts.challenge });

	return jsonOk<GetRes>({ opts });
};

export const GET = getPasskeyAuthOpts;
