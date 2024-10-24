import { z } from 'zod';
import { langs } from '../lang.service.common';

export const getRandomColorReqSchema = z.object({
	lang: z.enum(langs),
	excludeColor: z.string(),
	simulateDelay: z.boolean().optional(),
});
export type GetRandomColorReq = z.infer<typeof getRandomColorReqSchema>;
export type GetRandomColorRes = { color: string };
