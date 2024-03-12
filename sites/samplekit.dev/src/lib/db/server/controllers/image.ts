import { eq } from 'drizzle-orm';
import { db } from '..';
import { presignedUrls } from '../schema/image/index';

export const presigned = {
	insert: ({ userId, bucketUrl, key }: { userId: string; bucketUrl: string; key: string }) =>
		db
			.insert(presignedUrls)
			.values({ userId, bucketUrl, key, created: new Date() })
			.onConflictDoUpdate({ target: presignedUrls.userId, set: { created: new Date(), bucketUrl, key } }),

	get: ({ userId }: { userId: string }) =>
		db
			.select()
			.from(presignedUrls)
			.where(eq(presignedUrls.userId, userId))
			.limit(1)
			.then((r) => r[0]),

	delete: ({ userId }: { userId: string }) => db.delete(presignedUrls).where(eq(presignedUrls.userId, userId)),
};
