import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import type { croppedImgSchema } from '$lib/image/client';

// user is a reserved keyword in postgres
export const users = pgTable('user_account', {
	id: varchar('id').primaryKey(),
	email: varchar('email').notNull(),
	givenName: varchar('given_name').notNull(),
	familyName: varchar('family_name').notNull(),
	joinedOn: timestamp('joined_on', { mode: 'date' }).notNull(),
	avatar: jsonb('avatar').$type<z.infer<typeof croppedImgSchema>>(),
});
export const userSchema = createSelectSchema(users);

export type UserT = typeof users.$inferSelect;
