import { collectionFragment } from './fragments';

export const getCollectionQuery = /* GraphQL */ `
	query getCollection($handle: String!) {
		collection(handle: $handle) {
			...collection
		}
	}
	${collectionFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
	query getCollections {
		collections(first: 100, sortKey: TITLE) {
			edges {
				node {
					...collection
				}
			}
		}
	}
	${collectionFragment}
`;
