import { z } from 'zod';
import type { Cart } from '$lib/shop';

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
