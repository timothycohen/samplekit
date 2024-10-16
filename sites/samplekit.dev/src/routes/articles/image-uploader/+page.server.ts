import { processCode, processCodeDefined } from '$lib/articles/load/demos/server';

const code = {
	ui: processCode([
		{
			title: 'FileInput.svelte',
			loadRaw: () => import('/src/lib/components/input/FileInput.svelte?raw'),
		},
		{
			title: 'ImageCrop.svelte',
			loadRaw: () => import('/src/lib/image/components/ImageCrop.svelte?raw'),
		},
		{
			title: 'ImageCardBtns.svelte',
			loadRaw: () => import('/src/lib/image/components/ImageCardBtns.svelte?raw'),
		},
		{
			title: 'ImageCardOverlays.svelte',
			loadRaw: () => import('/src/lib/image/components/ImageCardOverlays.svelte?raw'),
		},
		{
			title: 'UploadProgress.svelte',
			loadRaw: () => import('/src/lib/image/components/UploadProgress.svelte?raw'),
		},
		{
			title: 'ConfirmDelAvatarModal.svelte',
			loadRaw: () => import('/src/routes/account/profile/ConfirmDelAvatarModal.svelte?raw'),
		},
	]),
	avatarEditor: await processCodeDefined({
		title: 'AvatarEditor.svelte',
		loadRaw: () => import('/src/routes/account/profile/AvatarEditor.svelte?raw'),
	}),
	objectStorage: await processCodeDefined({
		title: 'uploadToCloudStorage.ts',
		loadRaw: () => import('/src/lib/object-storage/client/uploadToCloudStorage.ts?raw'),
	}),
	api: {
		client: processCode([
			{
				title: 'crop.json/index.ts',
				loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/index.ts?raw'),
			},
			{
				title: 'upload.json/index.ts',
				loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/index.ts?raw'),
			},
		]),
		cropServer: await processCodeDefined({
			title: 'crop.json/+server.ts',
			loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/+server.ts?raw'),
		}),
		uploadServer: await processCodeDefined({
			title: 'upload.json/+server.ts',
			loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/+server.ts?raw'),
		}),
	},
	aws: processCode([
		{
			title: 's3.ts',
			loadRaw: () => import('/src/lib/object-storage/server/s3.ts?raw'),
		},
		{
			title: 'cloudfront.ts',
			loadRaw: () => import('/src/lib/object-storage/server/cloudfront.ts?raw'),
		},
		{
			title: 'rekognition.ts',
			loadRaw: () => import('/src/lib/object-storage/server/rekognition.ts?raw'),
		},
	]),
	keyController: await processCodeDefined({
		title: '$lib/object-storage/server/s3CloudfrontKeyController.ts',
		loadRaw: () => import('/src/lib/object-storage/server/s3CloudfrontKeyController.ts?raw'),
	}),
	unsavedUploadsCleaner: await processCodeDefined({
		title: '$lib/object-storage/server/unsavedUploadsCleaner.ts',
		loadRaw: () => import('/src/lib/object-storage/server/unsavedUploadsCleaner.ts?raw'),
	}),
	presigned: processCode([
		{
			title: 'presignedUrls.ts',
			loadRaw: () => import('/src/lib/db/server/schema/presignedUrls.ts?raw'),
		},
		{
			title: 'presignedUrlsController.ts',
			loadRaw: () => import('/src/lib/db/server/repository/presigned.ts?raw'),
		},
	]),
	imageSchema: await processCodeDefined({
		title: 'imageSchema.ts',
		loadRaw: () => import('/src/lib/image/common/schemas.ts?raw'),
	}),
	loadFileImports: await processCodeDefined({
		title: 'imageUtils.ts',
		loadRaw: () => import('/src/lib/image/client/utils.ts?raw'),
	}),
};

export const load = async () => {
	return { code };
};
