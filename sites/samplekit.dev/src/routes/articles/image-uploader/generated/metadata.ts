import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/image-uploader/assets/image-uploader-thumbnail-1200w.webp';
export default {
	title: 'Image Cropper And Uploader',
	implementationPath: '/account/profile',
	srcCodeHref:
		'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/cloudStorage/client/cropImgUploadController.ts',
	description:
		'Select an image, upload it to an AWS S3 Bucket with a progress indicator, moderate it with Rekognition, save it to the DB, and serve it via AWS Cloudfront.',
	publishedAt: new Date('2024-03-20T20:37:01.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	tags: ['state controller', 'image uploads', 'aws', 'db', 's3', 'cloudfront', 'rekognition', 'rate limiting'],
	featured: true,
	articlePath: '/articles/image-uploader',
	wordCount: 4924,
	readingTime: 22,
	toc: [
		{
			title: 'Upload Flow Options',
			href: '/articles/image-uploader/#upload-flow-options',
			children: [
				{ title: '0.1 Server Heavy', href: '/articles/image-uploader/#0.1-server-heavy' },
				{ title: '0.2 With Webhook', href: '/articles/image-uploader/#0.2-with-webhook' },
				{ title: '0.3 Guarded Client Control', href: '/articles/image-uploader/#0.3-guarded-client-control' },
				{ title: 'Choice', href: '/articles/image-uploader/#choice' },
			],
		},
		{
			title: 'Client',
			href: '/articles/image-uploader/#client',
			children: [
				{
					title: 'State Controller Interface',
					href: '/articles/image-uploader/#state-controller-interface',
					children: [
						{ title: 'Property Types', href: '/articles/image-uploader/#property-types' },
						{ title: 'States', href: '/articles/image-uploader/#states' },
						{ title: 'HTTP Functions', href: '/articles/image-uploader/#http-functions' },
					],
				},
				{ title: 'State Controller Implementation', href: '/articles/image-uploader/#state-controller-implementation' },
				{ title: 'UI Components', href: '/articles/image-uploader/#ui-components' },
				{ title: 'Avatar Editor', href: '/articles/image-uploader/#avatar-editor' },
				{ title: 'Uploader', href: '/articles/image-uploader/#uploader' },
				{ title: 'Client Endpoints', href: '/articles/image-uploader/#client-endpoints' },
			],
		},
		{
			title: 'AWS',
			href: '/articles/image-uploader/#aws',
			children: [
				{ title: 'Install AWS SDKs', href: '/articles/image-uploader/#install-aws-sdks' },
				{
					title: 'Enable Services',
					href: '/articles/image-uploader/#enable-services',
					children: [
						{ title: 'Creating the S3 Bucket', href: '/articles/image-uploader/#creating-the-s3-bucket' },
						{ title: 'Creating the IAM Policy', href: '/articles/image-uploader/#creating-the-iam-policy' },
						{
							title: 'Creating the Cloudfront Distribution',
							href: '/articles/image-uploader/#creating-the-cloudfront-distribution',
						},
						{
							title: 'Add Cloudfront to the IAM Policy',
							href: '/articles/image-uploader/#add-cloudfront-to-the-iam-policy',
						},
						{
							title: 'Add Rekognition to the IAM Policy',
							href: '/articles/image-uploader/#add-rekognition-to-the-iam-policy',
						},
					],
				},
				{
					title: 'AWS Server Code',
					href: '/articles/image-uploader/#aws-server-code',
					children: [
						{ title: 'AWS SDKs', href: '/articles/image-uploader/#aws-sdks' },
						{ title: 'Helpers', href: '/articles/image-uploader/#helpers' },
					],
				},
			],
		},
		{
			title: 'Server',
			href: '/articles/image-uploader/#server',
			children: [
				{ title: 'Crop', href: '/articles/image-uploader/#crop' },
				{
					title: 'Upload',
					href: '/articles/image-uploader/#upload',
					children: [
						{ title: 'Rate Limiter', href: '/articles/image-uploader/#rate-limiter' },
						{ title: 'Signed URL Storage', href: '/articles/image-uploader/#signed-url-storage' },
						{ title: 'Endpoint', href: '/articles/image-uploader/#endpoint' },
					],
				},
			],
		},
		{ title: 'Conclusion', href: '/articles/image-uploader/#conclusion' },
	],
} satisfies LoadedFrontMatter;
