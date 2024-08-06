import { allPostData, featureCards } from '$lib/articles/load/data/common';

export const load = async () => {
	return { allPostData, featureCards, layout: { showHeader: true, showFooter: true } };
};
