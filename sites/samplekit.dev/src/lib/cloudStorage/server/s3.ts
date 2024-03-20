import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { AWS_SERVICE_REGION, IAM_ACCESS_KEY_ID, IAM_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from '$env/static/private';
import { logger } from '$lib/logging/server';

export const getS3 = (() => {
	let s3: S3Client | null = null;

	const get = () => {
		if (s3) return s3;

		s3 = new S3Client({
			region: AWS_SERVICE_REGION,
			credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
		});

		return s3;
	};

	return get;
})();

/**
 * Generates a presigned URL and POST policy for uploading files to an S3 bucket.
 *
 * @param {number} [options.maxContentLength=5242880] - (default 1024 * 1024 * 5: 5MB).
 * @param {number} [options.expireSeconds=60] - (default 60: 60sec).
 *
 * To use, convert `formDataFields` to a `FormData` object, append `('file', file)`, and `POST` to `bucketUrl`.
 */
export const generateS3UploadPost = async (a: { key: string; maxContentLength?: number; expireSeconds?: number }) => {
	try {
		const res = await createPresignedPost(getS3(), {
			Bucket: S3_BUCKET_NAME,
			Key: a.key,
			Expires: a?.expireSeconds ?? 60,
			Conditions: [['content-length-range', 0, a?.maxContentLength ?? 1024 * 1024 * 5]],
		});

		return {
			bucketUrl: res.url,
			formDataFields: res.fields,
		};
	} catch (err) {
		logger.error(err);
		return null;
	}
};

export const deleteS3Object = async ({
	key,
	guard,
}: {
	key: string;
	guard: null | (() => boolean);
}): Promise<boolean> => {
	if (guard && !guard()) return false;

	try {
		const deletecommand = new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
		await getS3().send(deletecommand);
		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
};
