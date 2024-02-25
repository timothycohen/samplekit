import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import {
	AWS_SERVICE_REGION,
	CLOUDFRONT_DISTRIBUTION_ID,
	IAM_ACCESS_KEY_ID,
	IAM_SECRET_ACCESS_KEY,
} from '$env/static/private';
import { logger } from '$lib/logging/server';

export const getCloudfront = (() => {
	let cloudfront: CloudFrontClient | null = null;

	const get = () => {
		if (cloudfront) return cloudfront;

		cloudfront = new CloudFrontClient({
			region: AWS_SERVICE_REGION,
			credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
		});

		return cloudfront;
	};

	return get;
})();

export const invalidateCloudfront = async ({ keys }: { keys: string[] }): Promise<boolean> => {
	const command = new CreateInvalidationCommand({
		DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
		InvalidationBatch: {
			Paths: {
				Quantity: keys.length,
				Items: keys.map((k) => `/${k}`),
			},
			CallerReference: Date.now().toString(),
		},
	});

	try {
		await getCloudfront().send(command);
		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
};
