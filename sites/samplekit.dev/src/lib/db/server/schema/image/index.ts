import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { uniqueUserReference } from '../userAndAuth/utils';

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

export const presignedUrls = pgTable('presigned_url', {
	...uniqueUserReference({ onDelete: 'cascade' }),
	bucketUrl: varchar('url').notNull(),
	key: varchar('key').primaryKey(),
	created: timestamp('created', { mode: 'date' }).notNull(),
});
