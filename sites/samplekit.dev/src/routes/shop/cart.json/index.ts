import { z } from 'zod';
import { createClientFetch } from '$lib/http/client';
import type { Cart } from '$lib/shop';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const postSchema = z.object({ id: z.string() });
export type PostReq = z.infer<typeof postSchema>;

export const delSchema = z.object({ lineId: z.string() });
export type DelReq = z.infer<typeof delSchema>;

export const putSchema = z.object({
	lineId: z.string(),
	variantId: z.string(),
	quantity: z.number(),
});
export type PutReq = z.infer<typeof putSchema>;

export type GetRes = { cart: Cart };

export const addCartItem = createClientFetch<RouteId, Result.Success, PostReq>('POST', '/shop/cart.json');
export const removeCartItem = createClientFetch<RouteId, Result.Success, DelReq>('DELETE', '/shop/cart.json');
export const updateCartItemQty = createClientFetch<RouteId, Result.Success, PutReq>('PUT', '/shop/cart.json');
export const getCartItems = createClientFetch<RouteId, GetRes>('GET', '/shop/cart.json');
