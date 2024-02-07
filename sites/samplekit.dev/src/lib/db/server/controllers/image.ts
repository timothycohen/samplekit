import { eq } from 'drizzle-orm';
import { db } from '..';
import { presignedUrls } from '../schema/image/index';

export const presigned = {
	insert: ({ userId, objectUrl }: { userId: string; objectUrl: string }) =>
		db
			.insert(presignedUrls)
			.values({ userId, objectUrl, created: new Date() })
			.onConflictDoUpdate({ target: presignedUrls.userId, set: { created: new Date(), objectUrl } }),

	get: ({ userId }: { userId: string }) =>
		db
			.select()
			.from(presignedUrls)
			.where(eq(presignedUrls.userId, userId))
			.limit(1)
			.then((r) => r[0]),

	delete: ({ userId }: { userId: string }) => db.delete(presignedUrls).where(eq(presignedUrls.userId, userId)),
};
