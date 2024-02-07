import { getPageQuery, getPagesQuery } from '../gql';
import { publicStorefront } from '../storefront';
import type { Page } from '../../types';

/** @throws Error */
export async function getPage(handle: string): Promise<Page> {
	const res = await publicStorefront.request(getPageQuery, { variables: { handle } });
	if (!res.data?.page) throw new Error('getPage');
	return res.data.page;
}

/** @throws Error */
export async function getPages(): Promise<Page[]> {
	const res = await publicStorefront.request(getPagesQuery);
	if (!res.data?.pages) throw new Error('getPages');
	return res.data.pages.edges.map((e) => e.node);
}
