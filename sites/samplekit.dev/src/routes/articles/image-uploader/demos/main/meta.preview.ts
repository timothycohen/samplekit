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
		loadRaw: () => import('/src/lib/cloudStorage/client/cropImgUploadController.svelte.ts?raw'),
	},
	{
		title: 'uploadToCloudStorage.ts',
		loadRaw: () => import('/src/lib/cloudStorage/client/uploadToCloudStorage.ts?raw'),
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
] satisfies ModuleDefinitions;
