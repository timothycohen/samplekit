import { CLOUDFRONT_URL, S3_BUCKET_URL } from '$env/static/private';

export const urlTransforms = {
	keyToS3Url: (key: string) => `${S3_BUCKET_URL}/${key}`,
	keyToCloudfrontUrl: (key: string) => `${CLOUDFRONT_URL}/${key}`,
	s3UrlToKey: (url: string) => url.replace(`${S3_BUCKET_URL}/`, ''),
	s3UrlToCloudfrontUrl: (url: string) => url.replace(S3_BUCKET_URL, CLOUDFRONT_URL),
	cloudfrontUrlToKey: (url: string) => url.replace(`${CLOUDFRONT_URL}/`, ''),
	cloudfrontUrlToS3Url: (url: string) => url.replace(CLOUDFRONT_URL, S3_BUCKET_URL),
};
