import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import type { CroppedImg } from '$lib/image/common';

// user is a reserved keyword in postgres
export const users = pgTable('user_account', {
	id: varchar('id').primaryKey(),
	email: varchar('email').notNull(),
	givenName: varchar('given_name').notNull(),
	familyName: varchar('family_name').notNull(),
	joinedOn: timestamp('joined_on', { mode: 'date' }).notNull(),
	avatar: jsonb('avatar').$type<CroppedImg>(),
});
export const userSchema = createSelectSchema(users);
