import { logger } from '$lib/logging/server';
import { invalidateCloudfront } from './cloudfront';
import { deleteS3Object } from './s3';
import { s3CloudfrontKeyController } from './s3CloudfrontKeyController';
import type { ObjectStorage } from './types';

/**
 * Removes any images that were uploaded but haven't been stored within `jobDelaySeconds`.
 *
 * This is useful to protect against a client not notifying the server after an upload to a presigned url.
 */
export const createUnsavedUploadCleaner: ObjectStorage['createUnsavedUploadCleaner'] = ({
	getStoredUrl,
	jobDelaySeconds,
}: {
	getStoredUrl: ({ userId }: { userId: string }) => Promise<string | undefined | null>;
	jobDelaySeconds: number;
}) => {
	const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

	const rmUnusedImage = async ({ cdnUrl, userId }: { cdnUrl: string; userId: string }) => {
		const imageExists = await fetch(cdnUrl, { method: 'HEAD' }).then((res) => res.ok);
		if (!imageExists) return;

		const storedUrl = await getStoredUrl({ userId });
		if (storedUrl === cdnUrl) return;

		const key = s3CloudfrontKeyController.transform.cdnUrlToKey(cdnUrl);
		await Promise.all([deleteS3Object({ key, guard: null }), invalidateCloudfront({ keys: [key] })]);
		logger.info(`Deleted unsaved image for user ${userId} at ${cdnUrl}`);
	};

	const addDelayedJob = ({ cdnUrl, userId }: { cdnUrl: string; userId: string }) => {
		const timeout = setTimeout(async () => {
			await rmUnusedImage({ cdnUrl, userId });
			timeouts.delete(cdnUrl);
		}, jobDelaySeconds * 1000);

		timeouts.set(cdnUrl, timeout);
	};

	const removeJob = ({ cdnUrl }: { cdnUrl: string }) => {
		const timeout = timeouts.get(cdnUrl);
		if (timeout) {
			clearTimeout(timeout);
			timeouts.delete(cdnUrl);
		}
	};

	return { addDelayedJob, removeJob };
};
