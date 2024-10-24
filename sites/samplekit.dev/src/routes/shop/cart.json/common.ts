import { z } from 'zod';
import type { Cart } from '$lib/shop';
import type { Result } from '$lib/utils/common';

export const addCartItemReqSchema = z.object({ id: z.string() });
export type AddCartItemReq = z.infer<typeof addCartItemReqSchema>;
export type AddCartItemRes = Result.Success;

export const removeCartItemReqSchema = z.object({ lineId: z.string() });
export type RemoveCartItemReq = z.infer<typeof removeCartItemReqSchema>;
export type RemoveCartItemRes = Result.Success;

export const updateCartItemQtyReqSchema = z.object({ lineId: z.string(), variantId: z.string(), quantity: z.number() });
export type UpdateCartItemQtyReq = z.infer<typeof updateCartItemQtyReqSchema>;
export type UpdateCartItemQtyRes = Result.Success;

export type GetCartItemsRes = { cart: Cart };
