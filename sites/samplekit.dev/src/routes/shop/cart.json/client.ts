import { ClientFetcher } from '$lib/http/client.svelte';
import type { Result } from '$lib/utils/common';
import type { RouteId } from './$types';
import type { PostReq, DelReq, PutReq, GetRes } from './common';

export const addCartItem = new ClientFetcher<RouteId, Result.Success, PostReq>('POST', '/shop/cart.json');
export const removeCartItem = new ClientFetcher<RouteId, Result.Success, DelReq>('DELETE', '/shop/cart.json');
export const updateCartItemQty = new ClientFetcher<RouteId, Result.Success, PutReq>('PUT', '/shop/cart.json');
export const getCartItems = new ClientFetcher<RouteId, GetRes>('GET', '/shop/cart.json');
