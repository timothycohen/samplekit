import { checkedRedirect } from '$lib/http/server';
import { cap } from '$lib/utils/common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (seshUser) return checkedRedirect('/account/profile');

	return { provider: params.provider ? cap(params.provider) : null };
};
