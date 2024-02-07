import { getCollectionQuery, getCollectionsQuery } from '../gql';
import { publicStorefront } from '../storefront';
import type { Collection } from '../../types';

export async function getCollection(handle: string): Promise<Collection | undefined> {
	const res = await publicStorefront.request(getCollectionQuery, { variables: { handle } });
	return res.data?.collection ?? undefined;
}

/**
 * @throws Error
 *
 * Ignores 'frontpage'
 */
export async function getCollections(): Promise<Collection[]> {
	const res = await publicStorefront.request(getCollectionsQuery);
	if (!res.data?.collections) throw new Error('getCollections');
	return res.data.collections.edges.reduce<Collection[]>((acc, { node: collection }) => {
		if (collection.handle === 'frontpage') return acc;
		acc.push({ ...collection, firstProductImage: collection.products.edges[0]?.node.images.edges[0]?.node });
		return acc;
	}, []);
}
