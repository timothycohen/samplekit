import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { layout: { showHeader: true, showFooter: false } };
};
