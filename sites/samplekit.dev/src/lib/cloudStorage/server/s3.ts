import crypto from 'crypto';
import { DeleteObjectCommand, GetObjectTaggingCommand, PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {
	AWS_SERVICE_REGION,
	DB_NAME,
	IAM_ACCESS_KEY_ID,
	IAM_SECRET_ACCESS_KEY,
	S3_BUCKET_NAME,
} from '$env/static/private';
import { logger, setupLogger } from '$lib/logging/server';
import { urlTransforms } from './utils';

const s3 = new S3Client({
	region: AWS_SERVICE_REGION,
	credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
});
setupLogger.info('S3Client created.');

/**
 * Generates a presigned URL and POST policy for uploading files to an S3 bucket.
 *
 * @param {number} [options.maxContentLength=5242880] - (default 1024 * 1024 * 5: 5MB).
 * @param {number} [options.expireSeconds=60] - (default 60: 60sec).
 *
 */
export const generateS3UploadPost = async (a?: { maxContentLength?: number; expireSeconds?: number }) => {
	try {
		const rawBytes = crypto.randomBytes(16);
		const key = rawBytes.toString('base64url');

		const res = await createPresignedPost(s3, {
			Bucket: S3_BUCKET_NAME,
			Key: key,
			Expires: a?.expireSeconds ?? 60,
			Conditions: [['content-length-range', 0, a?.maxContentLength ?? 1024 * 1024 * 5]],
		});

		return {
			uploadUrl: res.url,
			objectUrl: urlTransforms.keyToS3Url(key),
			fields: res.fields,
		};
	} catch (err) {
		logger.error(err);
		return null;
	}
};

export const deleteS3Object = async ({
	key,
	disregardEnv,
}: {
	key: string;
	disregardEnv?: boolean;
}): Promise<boolean> => {
	try {
		if (!disregardEnv) {
			const tagCommand = new GetObjectTaggingCommand({ Bucket: S3_BUCKET_NAME, Key: key });
			const res = await s3.send(tagCommand);
			const objEnv = res.TagSet?.find((tag) => tag.Key === 'environment')?.Value;

			if (objEnv !== DB_NAME) {
				logger.error(res);
				logger.error(`Unable to delete object in environment ${objEnv} within environment ${DB_NAME}`);
				return false;
			}
		}

		const deletecommand = new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
		await s3.send(deletecommand);
		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
};

export const setS3Metadata = async ({
	key,
	tags,
}: {
	key: string;
	tags: { user_id: string; kind: string } & Record<string, string>;
}) => {
	const TagSet = Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
	TagSet.push({ Key: 'environment', Value: DB_NAME });

	const command = new PutObjectTaggingCommand({
		Bucket: S3_BUCKET_NAME,
		Key: key,
		Tagging: { TagSet },
	});

	try {
		await s3.send(command);
		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
};
