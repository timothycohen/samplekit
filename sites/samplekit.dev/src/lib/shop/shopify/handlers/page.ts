import { getPageQuery, getPagesQuery } from '../gql';
import { requestStorefront } from '../storefront';
import type { Page } from '../../types';

/** @throws Error */
export async function getPage({ handle, fetch }: { handle: string; fetch: Fetch }): Promise<Page> {
	const res = await requestStorefront({ operation: getPageQuery, variables: { handle }, fetch });
	if (!res.data?.page) throw new Error('getPage');
	return res.data.page;
}

/** @throws Error */
export async function getPages({ fetch }: { fetch: Fetch }): Promise<Page[]> {
	const res = await requestStorefront({ operation: getPagesQuery, fetch });
	if (!res.data?.pages) throw new Error('getPages');
	return res.data.pages.edges.map((e) => e.node);
}
