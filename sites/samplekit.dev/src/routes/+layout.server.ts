import { getThemeOnServer } from '$lib/styles/storeTheme';

export const load = async ({ locals, cookies }) => {
	return {
		user: await locals.seshHandler.getVerifiedUser(),
		layout: { showHeader: true, showFooter: false },
		initialTheme: getThemeOnServer(cookies),
	};
};
