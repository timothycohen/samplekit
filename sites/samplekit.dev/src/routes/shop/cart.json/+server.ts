import { dev } from '$app/environment';
import { jsonFail, jsonOk, parseReqJson } from '$lib/http/server';
import { shop } from '$lib/shop';
import {
	addCartItemReqSchema,
	removeCartItemReqSchema,
	updateCartItemQtyReqSchema,
	type AddCartItemRes,
	type RemoveCartItemRes,
	type UpdateCartItemQtyRes,
	type GetCartItemsRes,
} from './common';
import type { RequestHandler } from '@sveltejs/kit';

const addCartItem: RequestHandler = async ({ request, cookies, fetch }) => {
	const body = await parseReqJson(request, addCartItemReqSchema);
	if (!body.success) return jsonFail(400);
	const merchandiseId = body.data.id;

	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await shop.cart.get({ cartId, fetch });

	if (!cartId || !cart) {
		try {
			cart = await shop.cart.create({ fetch });
		} catch {
			return jsonFail(500, 'Could not create cart');
		}
		cartId = cart.id;
		cookies.set('cartId', cartId!, { httpOnly: true, secure: !dev, path: '/', maxAge: 86400 });
	}

	try {
		await shop.cart.addTo({ cartId, lines: [{ merchandiseId, quantity: 1 }], fetch });
	} catch {
		return jsonFail(500, 'Could not add to cart');
	}

	return jsonOk<AddCartItemRes>({ message: 'Success' });
};

const removeCartItem: RequestHandler = async ({ request, cookies, fetch }) => {
	const body = await parseReqJson(request, removeCartItemReqSchema);
	if (!body.success) return jsonFail(400);
	const { lineId } = body.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		await shop.cart.removeFrom({ cartId, lineIds: [lineId], fetch });
		return jsonOk<RemoveCartItemRes>({ message: 'Success' });
	} catch {
		return jsonFail(500, 'Error removing item from cart');
	}
};

const updateCartItemQty: RequestHandler = async ({ request, cookies, fetch }) => {
	const body = await parseReqJson(request, updateCartItemQtyReqSchema);
	if (!body.success) return jsonFail(400);
	const { lineId, quantity, variantId } = body.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		if (quantity === 0) {
			await shop.cart.removeFrom({ cartId, lineIds: [lineId], fetch });
		} else {
			await shop.cart.update({ cartId, lines: [{ id: lineId, merchandiseId: variantId, quantity }], fetch });
		}
		return jsonOk<UpdateCartItemQtyRes>({ message: 'Success' });
	} catch {
		return jsonFail(500, 'Error updating item quantity');
	}
};

const getCartItems: RequestHandler = async ({ cookies, fetch }) => {
	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await shop.cart.get({ cartId, fetch });

	if (!cartId || !cart) {
		try {
			cart = await shop.cart.create({ fetch });
		} catch {
			return jsonFail(500, 'Could not create cart');
		}
		cartId = cart.id;
		cookies.set('cartId', cartId!, { httpOnly: true, secure: !dev, path: '/', maxAge: 86400 });
	}

	return jsonOk<GetCartItemsRes>({ cart });
};

export const POST = addCartItem;
export const DELETE = removeCartItem;
export const PUT = updateCartItemQty;
export const GET = getCartItems;
