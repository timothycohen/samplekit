import { z } from 'zod';
import type { Result } from '$lib/utils/common';

export const pizzaEventName = 'pizza';

export const minPizza = 1;
export const maxPizza = 5;

export const pizzaClientMsgSchema = z.object({ count: z.number() });
export type PizzaClientMsg = z.infer<typeof pizzaClientMsgSchema>;
export type PizzaClientEvent = { [pizzaEventName]: (msg: PizzaClientMsg) => void };

export type PizzaServerMsg = { pizzaCount: number };
export type PizzaServerEvent = { [pizzaEventName]: (msg: Result<PizzaServerMsg>) => void };
