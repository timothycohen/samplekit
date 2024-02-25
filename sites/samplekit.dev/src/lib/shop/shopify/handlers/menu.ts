import { getMenuQuery } from '../gql';
import { getStorefront } from '../storefront';
import type { Menu } from '../../types';

export async function getMenu(handle: string): Promise<Menu> {
	const res = await getStorefront().request(getMenuQuery, { variables: { handle } });
	return res.data?.menu?.items ?? [];
}
