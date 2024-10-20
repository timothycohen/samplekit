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
		loadRaw: () => import('/src/lib/object-storage/client/cropImgUploadController.svelte.ts?raw'),
	},
	{
		title: 'uploadToCloudStorage.ts',
		loadRaw: () => import('/src/lib/object-storage/client/uploadToCloudStorage.ts?raw'),
	},
	{
		title: 'crop.json/common.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/common.ts?raw'),
	},
	{
		title: 'crop.json/client.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/client.ts?raw'),
	},
	{
		title: 'crop.json/+server.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/crop.json/+server.ts?raw'),
	},
	{
		title: 'upload.json/common.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/common.ts?raw'),
	},
	{
		title: 'upload.json/client.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/client.ts?raw'),
	},
	{
		title: 'upload.json/+server.ts',
		loadRaw: () => import('/src/routes/account/profile/avatar/upload.json/+server.ts?raw'),
	},
] satisfies ModuleDefinitions;
