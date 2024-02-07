import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: await locals.seshHandler.getVerifiedUser(), layout: { showHeader: true, showFooter: false } };
};
