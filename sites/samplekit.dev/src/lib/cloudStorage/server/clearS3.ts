import { DeleteObjectsCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { DB_NAME, S3_BUCKET_NAME } from '$env/static/private';
import { logger } from '$lib/logging/server';
import { getS3 } from './s3';

export const clearBucket = async () => {
	const objects = await (async () => {
		try {
			const listObjectsCommand = new ListObjectsCommand({ Bucket: S3_BUCKET_NAME, Prefix: DB_NAME });
			return (
				(await getS3()
					.send(listObjectsCommand)
					.then((o) => o.Contents?.map((o) => ({ Key: o.Key })))) ?? false
			);
		} catch (err) {
			logger.error(err);
			return false;
		}
	})();

	if (!objects) return { deletedCount: 0 };

	try {
		const deleteObjectsCommand = new DeleteObjectsCommand({
			Bucket: S3_BUCKET_NAME,
			Delete: { Objects: objects },
		});

		return { deletedCount: (await getS3().send(deleteObjectsCommand)).Deleted?.length ?? 0 };
	} catch (err) {
		logger.error(err);
		return { deletedCount: 0 };
	}
};
