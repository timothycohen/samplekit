import { productFragment } from './fragments';

export const getProductQuery = /* GraphQL */ `
	query getProduct($handle: String!) {
		product(handle: $handle) {
			...product
		}
	}
	${productFragment}
`;

/** https://shopify.dev/docs/api/storefront/2023-10/objects/Product#query-products */
export const getProductsQuery = /* GraphQL */ `
	query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $first: Int) {
		products(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {
			edges {
				node {
					...product
				}
			}
		}
	}
	${productFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
	query getProductRecommendations($productId: ID!) {
		productRecommendations(productId: $productId) {
			...product
		}
	}
	${productFragment}
`;

/** https://shopify.dev/docs/api/storefront/2023-10/objects/Collection#connection-collection-products */
export const getCollectionProductsQuery = /* GraphQL */ `
	query getCollectionProducts(
		$handle: String!
		$sortKey: ProductCollectionSortKeys
		$reverse: Boolean
		$productFilter: [ProductFilter!]
	) {
		collection(handle: $handle) {
			products(sortKey: $sortKey, reverse: $reverse, first: 100, filters: $productFilter) {
				edges {
					node {
						...product
					}
				}
			}
		}
	}
	${productFragment}
`;
