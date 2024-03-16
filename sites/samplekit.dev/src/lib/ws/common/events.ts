import { z } from 'zod';

export const clientToServer = {
	pizza: z.object({ count: z.number(), party: z.boolean() }),
	error: z.object({ status: z.number(), message: z.string(), eventId: z.string() }),
	bounce: z.object({ status: z.number(), message: z.string() }),
};

export const serverToClient = {
	pizza: z.object({ pizzas: z.string() }),
	forceInvalidation: z.object({ reason: z.string() }),
	error: z.object({ status: z.number(), message: z.string(), eventId: z.string() }),
	bounce: z.object({ status: z.number(), message: z.string() }),
};
