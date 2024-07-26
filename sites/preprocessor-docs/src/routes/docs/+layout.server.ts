import { getOnServer } from '$lib/nav';

export const load = async ({ cookies }) => {
	return {
		initialSidebarState: getOnServer(cookies),
	};
};
