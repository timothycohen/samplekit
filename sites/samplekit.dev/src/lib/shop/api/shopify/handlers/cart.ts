import {
	addToCartMutation,
	createCartMutation,
	editCartItemsMutation,
	getCartQuery,
	removeFromCartMutation,
} from '../gql';
import { requestStorefront } from '../storefront';
import type { GetCartQuery } from '$generated/shopify-graphql-types/storefront.generated';
import type { AddToCart, Cart, CreateCart, GetCart, RemoveFromCart, UpdateCart } from '../../types';

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
export const createCart: CreateCart = async ({ fetch }) => {
	const res = await requestStorefront({ operation: createCartMutation, fetch });
	const cart = res.data?.cartCreate?.cart;
	if (!cart) throw new Error('createCart');
	return reshapeCart(cart);
};

/** @throws Error */
export const addToCart: AddToCart = async ({ cartId, lines, fetch }) => {
	const res = await requestStorefront({ operation: addToCartMutation, variables: { cartId, lines }, fetch });
	const cart = res.data?.cartLinesAdd?.cart;
	if (!cart) throw new Error('addToCart');
	return reshapeCart(cart);
};

/** @throws Error */
export const removeFromCart: RemoveFromCart = async ({ cartId, lineIds, fetch }) => {
	const res = await requestStorefront({
		operation: removeFromCartMutation,
		variables: { cartId, lineIds },
		fetch,
	});
	const cart = res.data?.cartLinesRemove?.cart;
	if (!cart) throw new Error('removeFromCart');
	return reshapeCart(cart);
};

/** @throws Error */
export const updateCart: UpdateCart = async ({ cartId, lines, fetch }) => {
	const res = await requestStorefront({
		operation: editCartItemsMutation,
		variables: { cartId, lines },
		fetch,
	});
	const cart = res.data?.cartLinesUpdate?.cart;
	if (!cart) throw new Error('updateCart');
	return reshapeCart(cart);
};

export const getCart: GetCart = async ({ cartId, fetch }) => {
	const res = await requestStorefront({ operation: getCartQuery, variables: { cartId }, fetch });
	const cart = res.data?.cart;
	if (!cart) return undefined;
	else return reshapeCart(cart);
};
