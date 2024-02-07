import { DetectModerationLabelsCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { AWS_SERVICE_REGION, IAM_ACCESS_KEY_ID, IAM_SECRET_ACCESS_KEY, S3_BUCKET_NAME } from '$env/static/private';
import { logger } from '$lib/logging/server';

const rekognition = new RekognitionClient({
	region: AWS_SERVICE_REGION,
	credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
});

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
		const res = (await rekognition.send(labelCommand)) as {
			ModerationLabels: { Confidence: number; Name: string; ParentName: string }[];
		};
		const labels = res.ModerationLabels;
		if (labels.length) {
			return { error: { message: `Image may contain inappropriate content: ${labels[0]?.Name}.` } };
		}
	} catch (err) {
		logger.error(`Error detecting moderation labels for ${s3Key}:\n`, err);
		return { error: { message: 'Error detecting moderation labels' } };
	}

	return {};
};
