import {
	addToCartMutation,
	createCartMutation,
	editCartItemsMutation,
	getCartQuery,
	removeFromCartMutation,
} from '../gql';
import { requestStorefront } from '../storefront';
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
export async function createCart({ fetch }: { fetch: Fetch }): Promise<Cart> {
	const res = await requestStorefront({ operation: createCartMutation, fetch });
	const cart = res.data?.cartCreate?.cart;
	if (!cart) throw new Error('createCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function addToCart({
	cartId,
	lines,
	fetch,
}: {
	cartId: string;
	lines: { merchandiseId: string; quantity: number }[];
	fetch: Fetch;
}): Promise<Cart> {
	const res = await requestStorefront({ operation: addToCartMutation, variables: { cartId, lines }, fetch });
	const cart = res.data?.cartLinesAdd?.cart;
	if (!cart) throw new Error('addToCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function removeFromCart({
	cartId,
	lineIds,
	fetch,
}: {
	cartId: string;
	lineIds: string[];
	fetch: Fetch;
}): Promise<Cart> {
	const res = await requestStorefront({
		operation: removeFromCartMutation,
		variables: { cartId, lineIds },
		fetch,
	});
	const cart = res.data?.cartLinesRemove?.cart;
	if (!cart) throw new Error('removeFromCart');
	return reshapeCart(cart);
}

/** @throws Error */
export async function updateCart({
	cartId,
	lines,
	fetch,
}: {
	cartId: string;
	lines: { id: string; merchandiseId: string; quantity: number }[];
	fetch: Fetch;
}): Promise<Cart> {
	const res = await requestStorefront({
		operation: editCartItemsMutation,
		variables: { cartId, lines },
		fetch,
	});
	const cart = res.data?.cartLinesUpdate?.cart;
	if (!cart) throw new Error('updateCart');
	return reshapeCart(cart);
}

export async function getCart({ cartId, fetch }: { cartId: string; fetch: Fetch }): Promise<Cart | undefined> {
	const res = await requestStorefront({ operation: getCartQuery, variables: { cartId }, fetch });
	const cart = res.data?.cart;
	if (!cart) return undefined;
	else return reshapeCart(cart);
}
