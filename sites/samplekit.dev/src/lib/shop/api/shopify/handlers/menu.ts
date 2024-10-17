import { getMenuQuery } from '../gql';
import { requestStorefront } from '../storefront';
import type { GetMenu } from '../../types';

export const getMenu: GetMenu = async ({ handle, fetch }) => {
	const res = await requestStorefront({ operation: getMenuQuery, variables: { handle }, fetch });
	return res.data?.menu?.items ?? [];
};
