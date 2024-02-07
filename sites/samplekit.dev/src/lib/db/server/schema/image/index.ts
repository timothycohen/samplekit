import { z } from 'zod';

export const croppedImgSchema = z.object({
	url: z.string().url(),
	crop: z
		.object({
			position: z.object({ x: z.number(), y: z.number() }),
			aspect: z.number(),
			rotation: z.number(),
			scale: z.number(),
		})
		.default({ position: { x: 0, y: 0 }, aspect: 1, rotation: 0, scale: 1 }),
});
