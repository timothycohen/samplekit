import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { uniqueUserReference } from '../userAndAuth/utils';

export const presignedUrls = pgTable('presigned_url', {
	...uniqueUserReference({ onDelete: 'cascade' }),
	bucketUrl: varchar('url').notNull(),
	key: varchar('key').primaryKey(),
	created: timestamp('created', { mode: 'date' }).notNull(),
});
