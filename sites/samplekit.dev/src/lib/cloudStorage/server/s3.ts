import crypto from 'crypto';
import {
	DeleteObjectCommand,
	GetObjectTaggingCommand,
	PutObjectCommand,
	PutObjectTaggingCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	AWS_SERVICE_REGION,
	DB_NAME,
	IAM_ACCESS_KEY_ID,
	IAM_SECRET_ACCESS_KEY,
	S3_BUCKET_NAME,
} from '$env/static/private';
import { logger } from '$lib/logging/server';
import { urlTransforms } from './utils';

const s3 = new S3Client({
	region: AWS_SERVICE_REGION,
	credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
});

export const generateS3UploadURL = async () => {
	try {
		const rawBytes = crypto.randomBytes(16);
		const key = rawBytes.toString('base64url');

		const command = new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });

		return {
			uploadUrl: await getSignedUrl(s3, command, { expiresIn: 60 }),
			objectUrl: urlTransforms.keyToS3Url(key),
		};
	} catch (err) {
		logger.error(err);
		return null;
	}
};

/** Default contentLength = 5MB */
export const generateS3UploadPost = async (
	{ contentLength }: { contentLength: number } = { contentLength: 1024 * 1024 * 5 },
) => {
	try {
		const rawBytes = crypto.randomBytes(16);
		const key = rawBytes.toString('base64url');

		const res = await createPresignedPost(s3, {
			Bucket: S3_BUCKET_NAME,
			Key: key,
			Expires: 60,
			Conditions: [['content-length-range', 0, contentLength]],
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
