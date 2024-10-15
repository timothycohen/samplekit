import { eq } from 'drizzle-orm';
import { users } from '../schema';
import { db } from '../singleton';
import type { DBRepository } from './types';

export const user: DBRepository['user'] = {
	get: async ({ userId }) => {
		return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
	},
	update: async ({ userId, values }) => {
		await db.update(users).set(values).where(eq(users.id, userId));
	},
};
