import { getMenuQuery } from '../gql';
import { publicStorefront } from '../storefront';
import type { Menu } from '../../types';

export async function getMenu(handle: string): Promise<Menu> {
	const res = await publicStorefront.request(getMenuQuery, { variables: { handle } });
	return res.data?.menu?.items ?? [];
}
