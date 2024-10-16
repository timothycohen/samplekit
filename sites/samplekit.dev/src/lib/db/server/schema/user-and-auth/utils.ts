import { varchar, type UpdateDeleteAction } from 'drizzle-orm/pg-core';
import { users } from './user';

export const userReference = (actions?: { onDelete: UpdateDeleteAction }) => ({
	userId: varchar('user_id')
		.references(() => users.id, actions)
		.notNull(),
});

export const uniqueUserReference = (actions?: { onDelete: UpdateDeleteAction }) => ({
	userId: varchar('user_id')
		.references(() => users.id, actions)
		.notNull()
		.unique(),
});
