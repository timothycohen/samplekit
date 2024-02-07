import { redirect } from '@sveltejs/kit';
import { cap } from '$lib/utils/common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (seshUser) return redirect(302, '/account/profile');

	return { provider: params.provider ? cap(params.provider) : null };
};
