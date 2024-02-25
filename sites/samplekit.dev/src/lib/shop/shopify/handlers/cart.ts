import {
	addToCartMutation,
	createCartMutation,
	editCartItemsMutation,
	getCartQuery,
	removeFromCartMutation,
} from '../gql';
import { getStorefront } from '../storefront';
import type { GetCartQuery } from '$generated/shopify-graphql-types/storefront.generated';
import type { Cart } from '../../types';

const reshapeCart = (cart: NonNullable<GetCartQuery['cart']>): Cart => {
	return {
		...cart,
		cost: {
			...cart.cost,
			totalTaxAmount: cart.cost.totalTaxAmount || { amount: '0.0', currencyCode: 'USD' },
		},
		lines: cart.lines.edges.map((e) => ({
			...e.node,
			merchandise: {
				...e.node.merchandise,
				product: {
					...e.node.merchandise.product,
					images: e.node.merchandise.product.images.edges.map((e) => e.node),
					variants: e.node.merchandise.product.variants.edges.map((e) => e.node),
				},
			},
		})),
	};
};

/** @throws Error */
export async function createCart(): Promise<Cart> {
	const res = await getStorefront().request(createCartMutation);
	const cart = res.data?.cartCreate?.cart;
	if (!cart) throw new Error('createCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
	const res = await getStorefront().request(addToCartMutation, { variables: { cartId, lines } });
	const cart = res.data?.cartLinesAdd?.cart;
	if (!cart) throw new Error('addToCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
	const res = await getStorefront().request(removeFromCartMutation, {
		variables: { cartId, lineIds },
	});
	const cart = res.data?.cartLinesRemove?.cart;
	if (!cart) throw new Error('removeFromCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function updateCart(
	cartId: string,
	lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
	const res = await getStorefront().request(editCartItemsMutation, {
		variables: { cartId, lines },
	});
	const cart = res.data?.cartLinesUpdate?.cart;
	if (!cart) throw new Error('updateCart');
	return reshapeCart(cart);
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
	const res = await getStorefront().request(getCartQuery, { variables: { cartId } });
	const cart = res.data?.cart;
	if (!cart) return undefined;
	else return reshapeCart(cart);
}
