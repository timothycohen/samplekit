import { mfaKinds, mfaLabels } from '$lib/auth/client';
import { auth } from '$lib/auth/server';
import { transports } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { jsonFail } from '$lib/http/server';
import type { Actions, PageServerLoad } from './$types';
import type { Action } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.seshHandler.userOrRedirect();

	const meta: App.PageData['meta'] = { title: 'Remove MFA | SampleKit' };

	return { user, meta };
};

const removeMFAWithSeshConf: Action<{ mfaKind: string }> = async ({ locals, params }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const mfaKind = params.mfaKind as DB.MFAs.Kind;
	if (!mfaKinds.includes(mfaKind)) return checkedRedirect('/account/security/auth');

	const timeRemaining = auth.session.getTempConf({ session });
	if (timeRemaining === null) return jsonFail(400, 'Verification expired');

	await Promise.all([
		auth.provider.pass.MFA.disable({ type: mfaKind, userId: user.id }),
		auth.session.deleteOthers({ userId: user.id, sessionId: session.id }),
		auth.session.removeTempConf({ sessionId: session.id }).then(() => locals.seshHandler.invalidateCache()),
		transports.sendEmail.MFAUpdate({ editKind: 'removed', email: user.email, mfaLabel: mfaLabels[mfaKind] }),
	]);

	return checkedRedirect(`/account/security/auth`);
};

export const actions: Actions = { removeMFAWithSeshConf };
