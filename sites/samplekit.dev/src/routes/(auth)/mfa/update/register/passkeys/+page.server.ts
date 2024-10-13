import { auth } from '$lib/auth/server';

export const load = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();
	const { email, givenName, id: userId } = user;

	const savedPasskeys = await auth.provider.pass.MFA.passkey.getSaved(user.id);
	const opts = await auth.provider.pass.MFA.passkey.createRegOpts({ email, savedPasskeys, givenName });
	await auth.token.passkeyChallenge.createOrReplace({ userId, challenge: opts.challenge });

	return {
		passkey: { opts },
	};
};
