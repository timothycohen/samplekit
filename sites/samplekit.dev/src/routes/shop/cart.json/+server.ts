import { dev } from '$app/environment';
import { jsonFail, jsonOk } from '$lib/http/server';
import { createCart, getCart, addToCart, removeFromCart, updateCart } from '$lib/shop';
import { delSchema, postSchema, putSchema, type GetRes } from '.';
import type { RequestHandler } from '@sveltejs/kit';

const addCartItem: RequestHandler = async ({ request, cookies, fetch }) => {
	const res = postSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const merchandiseId = res.data.id;

	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await getCart({ cartId, fetch });

	if (!cartId || !cart) {
		try {
			cart = await createCart({ fetch });
		} catch {
			return jsonFail(500, 'Could not create cart');
		}
		cartId = cart.id;
		cookies.set('cartId', cartId!, { httpOnly: true, secure: !dev, path: '/', maxAge: 86400 });
	}

	try {
		await addToCart({ cartId, lines: [{ merchandiseId, quantity: 1 }], fetch });
	} catch {
		return jsonFail(500, 'Could not add to cart');
	}

	return jsonOk();
};

const removeCartItem: RequestHandler = async ({ request, cookies, fetch }) => {
	const res = delSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const { lineId } = res.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		await removeFromCart({ cartId, lineIds: [lineId], fetch });
		return jsonOk();
	} catch {
		return jsonFail(500, 'Error removing item from cart');
	}
};

const updateCartItemQty: RequestHandler = async ({ request, cookies, fetch }) => {
	const res = putSchema.safeParse(await request.json().catch(() => ({})));
	if (!res.success) return jsonFail(400);
	const { lineId, quantity, variantId } = res.data;

	const cartId = cookies.get('cartId');
	if (!cartId) return jsonFail(400, 'Missing cart ID');

	try {
		if (quantity === 0) {
			await removeFromCart({ cartId, lineIds: [lineId], fetch });
		} else {
			await updateCart({ cartId, lines: [{ id: lineId, merchandiseId: variantId, quantity }], fetch });
		}
		return jsonOk();
	} catch {
		return jsonFail(500, 'Error updating item quantity');
	}
};

const getCartItems: RequestHandler = async ({ cookies, fetch }) => {
	let cartId = cookies.get('cartId');
	let cart;

	if (cartId) cart = await getCart({ cartId, fetch });

	if (!cartId || !cart) {
		try {
			cart = await createCart({ fetch });
		} catch {
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
