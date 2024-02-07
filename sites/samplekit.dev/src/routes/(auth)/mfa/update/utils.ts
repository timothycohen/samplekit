import { redirect } from '@sveltejs/kit';
import { mfaKinds } from '$lib/db/client';

type Res = { action: 'register' | 'remove'; desiredMFA: DB.MFAs.Kind };

const getBeforeValidatedParams = (searchParam: string | null): Res | null => {
	if (typeof searchParam !== 'string') return null;
	const [action, desiredMFA] = searchParam.split('-') as ['register' | 'remove' | undefined, DB.MFAs.Kind | undefined];
	if (!action || !['register', 'remove'].includes(action)) return null;
	if (!desiredMFA || !mfaKinds.includes(desiredMFA)) return null;
	return { action, desiredMFA };
};

const getAfterValidatedParams = (path: string): Res | null => {
	const split = path.split('/');
	const desiredMFA = (split.pop() as DB.MFAs.Kind) || undefined;
	const action = split.pop() as 'register' | 'remove' | undefined;
	if (!action || !['register', 'remove'].includes(action)) return null;
	if (!desiredMFA || !mfaKinds.includes(desiredMFA)) return null;
	return { action, desiredMFA };
};

export const desiredParamsOrRedirect = (arg: { verified: boolean; nextParam: string | null; path: string }): Res => {
	if (!arg.verified) {
		const after = getAfterValidatedParams(arg.path);
		if (after) return redirect(302, `/mfa/update?next=${after.action}-${after.desiredMFA}`);
		const before = getBeforeValidatedParams(arg.nextParam);
		if (!before) return redirect(302, '/account/security/auth');
		return before;
	} else {
		const before = getBeforeValidatedParams(arg.nextParam);
		if (before) return redirect(302, `/mfa/update/${before.action}/${before.desiredMFA}`);
		const after = getAfterValidatedParams(arg.path);
		if (!after) return redirect(302, '/account/security/auth');
		return after;
	}
};
