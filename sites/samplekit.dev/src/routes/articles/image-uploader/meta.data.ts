import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Image Cropper And Uploader',
	implementationSlug: '/account/profile',
	srcCodeHref:
		'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/cloudStorage/client/cropImgUploadController.svelte',
	description:
		'Select an image, upload it to an AWS S3 Bucket with a progress indicator, moderate it with Rekognition, save it to the DB, and serve it via AWS Cloudfront.',
	publishedAt: new Date('Wed Mar 20 16:37:01 2024 -0400'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/image-uploader-thumbnail-850w.webp',
	tags: ['state controller', 'image uploads', 'aws', 'db', 's3', 'cloudfront', 'rekognition', 'rate limiting'],
	featured: true,
} satisfies RawFrontMatter;
