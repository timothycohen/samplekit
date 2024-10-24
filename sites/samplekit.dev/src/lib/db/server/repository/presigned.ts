import { eq } from 'drizzle-orm';
import { presignedUrls } from '../schema/presignedUrls';
import { db } from '../singleton';
import type { DBRepository } from './types';

export const presigned: DBRepository['presigned'] = {
	insertOrOverwrite: async ({ userId, url, key, created }) => {
		await db
			.insert(presignedUrls)
			.values({ userId, url, key, created })
			.onConflictDoUpdate({ target: presignedUrls.userId, set: { created, url, key } });
	},
	get: async ({ userId }) => {
		return await db
			.select()
			.from(presignedUrls)
			.where(eq(presignedUrls.userId, userId))
			.limit(1)
			.then((r) => r[0]);
	},
	delete: async ({ userId }) => {
		await db.delete(presignedUrls).where(eq(presignedUrls.userId, userId));
	},
};
