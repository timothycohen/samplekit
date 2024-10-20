import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Cart } from '$lib/shop';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const addCartItemReqSchema = z.object({ id: z.string() });
export type AddCartItemReq = z.infer<typeof addCartItemReqSchema>;
export type AddCartItemRes = Result.Success;
export const addCartItem = new ClientFetcher<RouteId, AddCartItemRes, AddCartItemReq>('POST', '/shop/cart.json');

export const removeCartItemReqSchema = z.object({ lineId: z.string() });
export type RemoveCartItemReq = z.infer<typeof removeCartItemReqSchema>;
export type RemoveCartItemRes = Result.Success;
export const removeCartItem = new ClientFetcher<RouteId, RemoveCartItemRes, RemoveCartItemReq>(
	'DELETE',
	'/shop/cart.json',
);

export const updateCartItemQtyReqSchema = z.object({ lineId: z.string(), variantId: z.string(), quantity: z.number() });
export type UpdateCartItemQtyReq = z.infer<typeof updateCartItemQtyReqSchema>;
export type UpdateCartItemQtyRes = Result.Success;
export const updateCartItemQty = new ClientFetcher<RouteId, UpdateCartItemQtyRes, UpdateCartItemQtyReq>(
	'PUT',
	'/shop/cart.json',
);

export type GetCartItemsRes = { cart: Cart };
export const getCartItems = new ClientFetcher<RouteId, GetCartItemsRes>('GET', '/shop/cart.json');
