import { imageFragment, seoFragment } from '../fragments';

export const collectionFragment = /* GraphQL */ `
	fragment collection on Collection {
		description
		handle
		image {
			...image
		}
		seo {
			...seo
		}
		title
		updatedAt

		products(first: 1) {
			edges {
				node {
					images(first: 1) {
						edges {
							node {
								...image
							}
						}
					}
				}
			}
		}
	}
	${seoFragment}
	${imageFragment}
`;
