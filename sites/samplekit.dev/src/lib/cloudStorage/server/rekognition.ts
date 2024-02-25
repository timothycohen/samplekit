import { DetectModerationLabelsCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { AWS_SERVICE_REGION, IAM_ACCESS_KEY_ID, IAM_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from '$env/static/private';
import { logger } from '$lib/logging/server';

export const getRekognition = (() => {
	let rekognition: RekognitionClient | null = null;

	const get = () => {
		if (rekognition) return rekognition;

		rekognition = new RekognitionClient({
			region: AWS_SERVICE_REGION,
			credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
		});

		return rekognition;
	};

	return get;
})();

export const detectModerationLabels = async ({
	s3Key,
	confidence = 75,
}: {
	s3Key: string;
	confidence?: number;
}): Promise<{ error: App.Error } | { error?: never }> => {
	const labelCommand = new DetectModerationLabelsCommand({
		Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: s3Key } },
		MinConfidence: confidence,
	});
	try {
		const res = (await getRekognition().send(labelCommand)) as {
			ModerationLabels: { Confidence: number; Name: string; ParentName: string }[];
		};
		const labels = res.ModerationLabels;
		if (labels.length) {
			return { error: { message: `Image may contain inappropriate content: ${labels[0]?.Name}.` } };
		}
	} catch (err) {
		logger.error({ msg: `Error detecting moderation labels for ${s3Key}:\n`, error: err });
		return { error: { message: 'Error detecting moderation labels' } };
	}

	return {};
};
