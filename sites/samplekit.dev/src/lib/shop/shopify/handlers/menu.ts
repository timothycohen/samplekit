import { getMenuQuery } from '../gql';
import { requestStorefront } from '../storefront';
import type { Menu } from '../../types';

export async function getMenu({ handle, fetch }: { handle: string; fetch: Fetch }): Promise<Menu> {
	const res = await requestStorefront({ operation: getMenuQuery, variables: { handle }, fetch });
	return res.data?.menu?.items ?? [];
}
