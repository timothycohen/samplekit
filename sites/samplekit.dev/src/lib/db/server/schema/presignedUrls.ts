import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { uniqueUserReference } from './user-and-auth/utils';

export const presignedUrls = pgTable('presigned_url', {
	...uniqueUserReference({ onDelete: 'cascade' }),
	url: varchar('url').notNull(),
	key: varchar('key').primaryKey(),
	created: timestamp('created', { mode: 'date' }).notNull().defaultNow(),
});
