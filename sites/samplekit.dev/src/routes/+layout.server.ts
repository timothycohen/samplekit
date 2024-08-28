import { getThemeOnServer } from '$lib/styles/storeTheme';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	return {
		user: await locals.seshHandler.getVerifiedUser(),
		layout: { showHeader: true, showFooter: false },
		initialTheme: getThemeOnServer(cookies),
	};
};
