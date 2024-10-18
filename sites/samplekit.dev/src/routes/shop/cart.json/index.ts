import { z } from 'zod';
import { ClientFetcher } from '$lib/http/client.svelte';
import type { Cart } from '$lib/shop';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';

export const postSchema = z.object({ id: z.string() });
export type PostReq = z.infer<typeof postSchema>;
export type PostRes = Result.Success;
export const addCartItem = new ClientFetcher<RouteId, PostRes, PostReq>('POST', '/shop/cart.json');

export const delSchema = z.object({ lineId: z.string() });
export type DelReq = z.infer<typeof delSchema>;
export type DelRes = Result.Success;
export const removeCartItem = new ClientFetcher<RouteId, DelRes, DelReq>('DELETE', '/shop/cart.json');

export const putSchema = z.object({ lineId: z.string(), variantId: z.string(), quantity: z.number() });
export type PutReq = z.infer<typeof putSchema>;
export type PutRes = Result.Success;
export const updateCartItemQty = new ClientFetcher<RouteId, PutRes, PutReq>('PUT', '/shop/cart.json');

export type GetRes = { cart: Cart };
export const getCartItems = new ClientFetcher<RouteId, GetRes>('GET', '/shop/cart.json');
