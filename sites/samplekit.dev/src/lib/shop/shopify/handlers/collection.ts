import { getCollectionQuery, getCollectionsQuery } from '../gql';
import { requestStorefront } from '../storefront';
import type { Collection } from '../../types';

export async function getCollection({
	handle,
	fetch,
}: {
	handle: string;
	fetch: Fetch;
}): Promise<Collection | undefined> {
	const res = await requestStorefront({ operation: getCollectionQuery, variables: { handle }, fetch });
	return res.data?.collection ?? undefined;
}

/**
 * @throws Error
 *
 * Ignores 'frontpage'
 */
export async function getCollections({ fetch }: { fetch: Fetch }): Promise<Collection[]> {
	const res = await requestStorefront({ operation: getCollectionsQuery, fetch });
	if (!res.data?.collections) throw new Error('getCollections');
	return res.data.collections.edges.reduce<Collection[]>((acc, { node: collection }) => {
		if (collection.handle === 'frontpage') return acc;
		acc.push({ ...collection, firstProductImage: collection.products.edges[0]?.node.images.edges[0]?.node });
		return acc;
	}, []);
}
