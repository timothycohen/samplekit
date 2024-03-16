import { z } from 'zod';

export const pizzaReqSchema = z.object({ count: z.number(), party: z.boolean() });
export type PizzaReq = z.infer<typeof pizzaReqSchema>;
export type PizzaRes = { pizza: string };
