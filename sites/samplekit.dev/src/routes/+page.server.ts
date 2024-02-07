import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { layout: { showHeader: true, showFooter: true } };
};
