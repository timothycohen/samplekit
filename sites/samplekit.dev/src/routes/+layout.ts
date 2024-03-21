import { kebabToTitleCase } from '$lib/utils/common';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, url }) => {
	let page = url.pathname.split('/').pop();
	if (page) page = kebabToTitleCase(page);
	const siteTitle = url.pathname.startsWith('/shop') ? 'SampleKit Shop' : 'SampleKit';
	const title = page ? `${page} | ${siteTitle}` : siteTitle;
	const meta: App.PageData['meta'] = { title };

	return { ...data, meta };
};
