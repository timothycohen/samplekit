import { ClientFetcher } from '$lib/http/client.svelte';
import type { RouteId } from './$types';
import type {
	AddCartItemRes,
	AddCartItemReq,
	RemoveCartItemRes,
	RemoveCartItemReq,
	UpdateCartItemQtyRes,
	UpdateCartItemQtyReq,
	GetCartItemsRes,
} from './common';

export const addCartItem = new ClientFetcher<RouteId, AddCartItemRes, AddCartItemReq>('POST', '/shop/cart.json');
export const removeCartItem = new ClientFetcher<RouteId, RemoveCartItemRes, RemoveCartItemReq>(
	'DELETE',
	'/shop/cart.json',
);
export const updateCartItemQty = new ClientFetcher<RouteId, UpdateCartItemQtyRes, UpdateCartItemQtyReq>(
	'PUT',
	'/shop/cart.json',
);
export const getCartItems = new ClientFetcher<RouteId, GetCartItemsRes>('GET', '/shop/cart.json');
