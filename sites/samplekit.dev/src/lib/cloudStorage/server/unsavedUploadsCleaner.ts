import { logger } from '$lib/logging/server';
import { invalidateCloudfront } from './cloudfront';
import { deleteS3Object } from './s3';
import { keyController } from './utils';

/**
 * Removes any images that were uploaded but haven't been stored within `jobDelaySeconds`.
 *
 * This is useful to protect against a client not notifying the server after an upload to a presigned url.
 */
export const createUnsavedUploadCleaner = ({
	getStoredUrl,
	jobDelaySeconds,
}: {
	getStoredUrl: ({ userId }: { userId: string }) => Promise<string | undefined | null>;
	jobDelaySeconds: number;
}) => {
	const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

	const rmUnusedImage = async ({ cloudfrontUrl, userId }: { cloudfrontUrl: string; userId: string }) => {
		const imageExists = await fetch(cloudfrontUrl, { method: 'HEAD' }).then((res) => res.ok);
		if (!imageExists) return;

		const storedUrl = await getStoredUrl({ userId });
		if (storedUrl === cloudfrontUrl) return;

		const key = keyController.transform.cloudfrontUrlToKey(cloudfrontUrl);
		await Promise.all([deleteS3Object({ key, guard: null }), invalidateCloudfront({ keys: [key] })]);
		logger.info(`Deleted unsaved image for user ${userId} at ${cloudfrontUrl}`);
	};

	const addDelayedJob = ({ cloudfrontUrl, userId }: { cloudfrontUrl: string; userId: string }) => {
		const timeout = setTimeout(async () => {
			await rmUnusedImage({ cloudfrontUrl, userId });
			timeouts.delete(cloudfrontUrl);
		}, jobDelaySeconds * 1000);

		timeouts.set(cloudfrontUrl, timeout);
	};

	const removeJob = ({ cloudfrontUrl }: { cloudfrontUrl: string }) => {
		const timeout = timeouts.get(cloudfrontUrl);
		if (timeout) {
			clearTimeout(timeout);
			timeouts.delete(cloudfrontUrl);
		}
	};

	return { addDelayedJob, removeJob };
};
