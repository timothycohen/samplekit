import { pageFragment } from './fragments';

export const getPageQuery = /* GraphQL */ `
	query getPage($handle: String!) {
		page(handle: $handle) {
			...page
		}
	}
	${pageFragment}
`;

export const getPagesQuery = /* GraphQL */ `
	query getPages {
		pages(first: 100) {
			edges {
				node {
					...page
				}
			}
		}
	}
	${pageFragment}
`;
