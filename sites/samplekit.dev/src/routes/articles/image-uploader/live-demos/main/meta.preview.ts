import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{
		title: 'Demo',
		loadComponent: () => import('./Demo.svelte'),
		icon: 'svelte',
		wrapperProps: { bg: true, center: true },
	},
	{
		title: 'AvatarEditor.svelte',
		loadRaw: () => import('/src/routes/account/profile/AvatarEditor.svelte?raw'),
	},
	{
		title: 'cropImgUploadController.ts',
		loadRaw: () => import('/src/lib/cloudStorage/client/cropImgUploadController.ts?raw'),
	},
	{
		title: 'uploadToCloudStorage.ts',
		loadRaw: () => import('/src/lib/cloudStorage/client/uploadToCloudStorage.ts?raw'),
	},
	{
		title: 'FileInput.svelte',
		loadRaw: () => import('/src/lib/components/input/FileInput.svelte?raw'),
	},
	{
		title: 'ImageCrop.svelte',
		loadRaw: () => import('/src/lib/image/client/ImageCrop.svelte?raw'),
	},
	{
		title: 'ImageCardBtns.svelte',
		loadRaw: () => import('/src/lib/image/client/ImageCardBtns.svelte?raw'),
	},
	{
		title: 'ImageCardOverlays.svelte',
		loadRaw: () => import('/src/lib/image/client/ImageCardOverlays.svelte?raw'),
	},
	{
		title: 'UploadProgress.svelte',
		loadRaw: () => import('/src/lib/image/client/UploadProgress.svelte?raw'),
	},
	{
		title: 'ConfirmDelAvatarModal.svelte',
		loadRaw: () => import('/src/routes/account/profile/ConfirmDelAvatarModal.svelte?raw'),
	},
	{
		title: 's3.ts',
		loadRaw: () => import('/src/lib/cloudStorage/server/s3.ts?raw'),
	},
	{
		title: 'cloudfront.ts',
		loadRaw: () => import('/src/lib/cloudStorage/server/cloudfront.ts?raw'),
	},
	{
		title: 'rekognition.ts',
		loadRaw: () => import('/src/lib/cloudStorage/server/rekognition.ts?raw'),
	},
	{
		title: 'keyController.ts',
		loadRaw: () => import('/src/lib/cloudStorage/server/utils.ts?raw'),
	},
	{
		title: 'unsavedUploadsCleaner.ts',
		loadRaw: () => import('/src/lib/cloudStorage/server/unsavedUploadsCleaner.ts?raw'),
	},
	{
		title: 'crop.json/index.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/index.ts?raw'),
	},
	{
		title: 'crop.json/+server.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/+server.ts?raw'),
	},
	{
		title: 'upload.json/index.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/index.ts?raw'),
	},
	{
		title: 'upload.json/+server.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/+server.ts?raw'),
	},
	{
		title: 'imageSchema.ts',
		loadRaw: () => import('/src/lib/image/common/schemas.ts?raw'),
	},
	{
		title: 'imageUtils.ts',
		loadRaw: () => import('/src/lib/image/client/utils.ts?raw'),
	},
	{
		title: 'presignedUrls.ts',
		loadRaw: () => import('/src/lib/db/server/schema/image/index.ts?raw'),
	},
	{
		title: 'presignedUrlsController.ts',
		loadRaw: () => import('/src/lib/db/server/controllers/image.ts?raw'),
	},
] satisfies ModuleDefinitions;
