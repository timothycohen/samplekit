import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';

export const users = pgTable('user_account', {
	id: varchar('id').primaryKey(),
});
export const userSchema = createSelectSchema(users);
