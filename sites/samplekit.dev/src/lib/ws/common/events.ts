import { z } from 'zod';

export const clientToServer = {
	error: z.object({ status: z.number(), message: z.string(), eventId: z.string() }),
	bounce: z.object({ status: z.number(), message: z.string() }),
};

export const serverToClient = {
	forceInvalidation: z.object({ reason: z.string() }),
	error: z.object({ status: z.number(), message: z.string(), eventId: z.string() }),
	bounce: z.object({ status: z.number(), message: z.string() }),
};
