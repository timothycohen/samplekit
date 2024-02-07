import { cartFragment } from './fragments';

export const getCartQuery = /* GraphQL */ `
	query getCart($cartId: ID!) {
		cart(id: $cartId) {
			...cart
		}
	}
	${cartFragment}
`;
