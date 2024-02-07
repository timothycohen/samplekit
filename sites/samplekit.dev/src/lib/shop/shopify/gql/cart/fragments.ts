import { productFragment } from '../product/fragments';

export const cartFragment = /* GraphQL */ `
	fragment cart on Cart {
		checkoutUrl
		cost {
			subtotalAmount {
				amount
				currencyCode
			}
			totalAmount {
				amount
				currencyCode
			}
			totalTaxAmount {
				amount
				currencyCode
			}
		}
		id
		lines(first: 100) {
			edges {
				node {
					cost {
						totalAmount {
							amount
							currencyCode
						}
					}
					id
					merchandise {
						... on ProductVariant {
							id
							product {
								...product
							}
							selectedOptions {
								name
								value
							}
							title
						}
					}
					quantity
				}
			}
		}
		totalQuantity
	}
	${productFragment}
`;
