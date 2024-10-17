import { getPageQuery, getPagesQuery } from '../gql';
import { requestStorefront } from '../storefront';
import type { GetPage, GetPages } from '../../types';

/** @throws Error */
export const getPage: GetPage = async ({ handle, fetch }) => {
	const res = await requestStorefront({ operation: getPageQuery, variables: { handle }, fetch });
	if (!res.data?.page) throw new Error('getPage');
	return res.data.page;
};

/** @throws Error */
export const getPages: GetPages = async ({ fetch }) => {
	const res = await requestStorefront({ operation: getPagesQuery, fetch });
	if (!res.data?.pages) throw new Error('getPages');
	return res.data.pages.edges.map((e) => e.node);
};
