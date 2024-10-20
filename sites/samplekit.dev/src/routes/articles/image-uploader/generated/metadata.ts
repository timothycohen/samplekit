import type { LoadedFrontMatter } from '$lib/articles/schemas';
import imgSm from '/src/routes/articles/image-uploader/assets/image-uploader-thumbnail-1200w.webp';
export default {
	title: 'Image Cropper And Uploader',
	implementationPath: '/account/profile',
	srcCodeHref:
		'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/object-storage/client/cropImgUploadController.svelte.ts',
	description:
		'Select an image, crop it, upload it to an AWS S3 Bucket with a progress indicator, moderate it with Rekognition, save it to the DB, and serve it via AWS Cloudfront.',
	publishedAt: new Date('2024-03-20T20:37:01.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	tags: ['state controller', 'image uploads', 'aws', 'db', 's3', 'cloudfront', 'rekognition', 'rate limiting'],
	featured: true,
	updates: [{ at: new Date('2024-08-16T22:59:25.000Z'), descriptions: ['Use runes.'] }],
	articlePath: '/articles/image-uploader',
	wordCount: 6096,
	readingTime: 28,
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
			title: 'State Controller',
			href: '/articles/image-uploader/#state-controller',
			children: [
				{ title: 'Crop Types', href: '/articles/image-uploader/#crop-types' },
				{
					title: 'States',
					href: '/articles/image-uploader/#states',
					children: [
						{ title: 'Static', href: '/articles/image-uploader/#static' },
						{ title: 'Preexisting', href: '/articles/image-uploader/#preexisting' },
						{ title: 'New', href: '/articles/image-uploader/#new' },
						{ title: 'Union', href: '/articles/image-uploader/#union' },
					],
				},
				{ title: 'Callback Types', href: '/articles/image-uploader/#callback-types' },
				{
					title: 'Implementation',
					href: '/articles/image-uploader/#implementation',
					children: [
						{ title: 'Idle Entrypoint', href: '/articles/image-uploader/#idle-entrypoint' },
						{ title: 'Preexisting Entrypoint', href: '/articles/image-uploader/#preexisting-entrypoint' },
						{ title: 'New Entrypoint', href: '/articles/image-uploader/#new-entrypoint' },
					],
				},
			],
		},
		{
			title: 'UI',
			href: '/articles/image-uploader/#ui',
			children: [
				{ title: 'Base Components', href: '/articles/image-uploader/#base-components' },
				{ title: 'Avatar Editor', href: '/articles/image-uploader/#avatar-editor' },
			],
		},
		{
			title: 'Dependency Injection Callbacks',
			href: '/articles/image-uploader/#dependency-injection-callbacks',
			children: [
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
			title: 'Server Endpoints',
			href: '/articles/image-uploader/#server-endpoints',
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
