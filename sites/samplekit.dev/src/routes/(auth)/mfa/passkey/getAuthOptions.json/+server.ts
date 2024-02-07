import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { jsonOk } from '$lib/http/server';
import type { GetRes } from '.';
import type { RequestHandler } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

const getPasskeyAuthOpts = async ({ locals }: RequestEvent) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');

	const savedPasskeys = await auth.provider.pass.MFA.passkey.getSaved(seshUser.user.id);
	const opts = await auth.provider.pass.MFA.passkey.createAuthOpts({ savedPasskeys });
	await auth.token.passkeyChallenge.createOrReplace({ userId: seshUser.user.id, challenge: opts.challenge });

	return jsonOk<GetRes>({ opts });
};

export const GET: RequestHandler = getPasskeyAuthOpts;
