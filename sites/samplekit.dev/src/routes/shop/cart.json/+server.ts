import { dev } from '$app/environment';
import { jsonFail, jsonOk } from '$lib/http/server';
import { createCart, getCart, addToCart, removeFromCart, updateCart } from '$lib/shop';
import { delSchema, postSchema, putSchema, type GetRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const addCartItem: RequestHandler = async ({ request, cookies }) => {
	const res = postSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const merchandiseId = res.data.id;

	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await getCart(cartId);

	if (!cartId || !cart) {
		try {
			cart = await createCart();
		} catch (err) {
			return jsonFail(500, 'Could not create cart');
		}
		cartId = cart.id;
		cookies.set('cartId', cartId!, { httpOnly: true, secure: !dev, path: '/', maxAge: 86400 });
	}

	try {
		await addToCart(cartId, [{ merchandiseId, quantity: 1 }]);
	} catch (err) {
		return jsonFail(500, 'Could not add to cart');
	}

	return jsonOk();
};

const removeCartItem: RequestHandler = async ({ request, cookies }) => {
	const res = delSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const { lineId } = res.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		await removeFromCart(cartId, [lineId]);
		return jsonOk();
	} catch (e) {
		return jsonFail(500, 'Error removing item from cart');
	}
};

const updateCartItemQty: RequestHandler = async ({ request, cookies }) => {
	const res = putSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const { lineId, quantity, variantId } = res.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		if (quantity === 0) {
			await removeFromCart(cartId, [lineId]);
		} else {
			await updateCart(cartId, [{ id: lineId, merchandiseId: variantId, quantity }]);
		}
		return jsonOk();
	} catch (e) {
		return jsonFail(500, 'Error updating item quantity');
	}
};

const getCartItems: RequestHandler = async ({ cookies }) => {
	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await getCart(cartId);

	if (!cartId || !cart) {
		try {
			cart = await createCart();
		} catch (err) {
			return jsonFail(500, 'Could not create cart');
		}
		cartId = cart.id;
		cookies.set('cartId', cartId!, { httpOnly: true, secure: !dev, path: '/', maxAge: 86400 });
	}

	return jsonOk<GetRes>({ cart });
};

export const POST = addCartItem;
export const DELETE = removeCartItem;
export const PUT = updateCartItemQty;
export const GET = getCartItems;
