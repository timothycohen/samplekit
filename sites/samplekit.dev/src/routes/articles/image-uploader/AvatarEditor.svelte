<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';

	interface Props {
		part: 1 | 2 | 3;
	}

	const { part }: Props = $props();
</script>

{#if part === 1}
	<CodeTopper title="AvatarEditor.svelte Part 1">
		<!-- shiki-start
```svelte
<script lang="ts">
	import { writable } from 'svelte/store';
	import type { CropControllerState } from '$lib/cloudStorage/client';

	const s = writable<CropControllerState>(
			avatar ? { state: 'cropping_preexisting', crop: avatar.crop, url: avatar.url } : { state: 'file_selecting' },
		);
</script>
```
shiki-end -->
	</CodeTopper>
{:else if part === 2}
	<CodeTopper title="AvatarEditor.svelte Part 2">
		<!-- shiki-start
```svelte
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { CropImgUploadController, type CropControllerState } from '$lib/cloudStorage/client';
	import { FileInput } from '$lib/components';
	import { ImageCrop, UploadProgress, ImageCardBtns, ImageCardOverlays } from '$lib/image/client';
	import ConfirmDelAvatarModal from './ConfirmDelAvatarModal.svelte';

	export let avatar: DB.User['avatar'];
	export let onCancel: () => void;
	export let updateAvatar: (img: DB.User['avatar']) => void;

	onDestroy(() => editAvatarController.cancel());

	const s = writable<CropControllerState>(
		avatar ? { state: 'cropping_preexisting', crop: avatar.crop, url: avatar.url } : { state: 'file_selecting' },
	);

	const editAvatarController = new CropImgUploadController(s);
</script>

{#if $s.state === 'file_selecting'}
	<FileInput onSelect={onFileSelected} accept="image/jpeg, image/png" />
{:else}
	<div class="relative aspect-square h-80 w-80 sm:h-[32rem] sm:w-[32rem]">
		{#if $s.state === 'error'}
			<ImageCardOverlays
				img={{ kind: 'overlay', url: $s.img.url, crop: $s.img.crop, blur: true }}
				overlay={{ red: true }}
				{onCancel}
				errorMsgs={$s.errorMsgs}
			/>
		{:else if $s.state === 'cropping_preexisting'}
			<ImageCrop url={$s.url} crop={$s.crop} onSave={onPreexistingImgCropped} />
			<ImageCardBtns {onCancel} onNew={fileSelectStart} onDelete={openDelConfirmation} />
		{:else if $s.state === 'db_updating_preexisting' || $s.state === 'deleting_preexisting'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.url, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
		{:else if $s.state === 'uri_loading'}
			<ImageCardOverlays img={{ kind: 'skeleton' }} />
		{:else if $s.state === 'uri_loaded'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: null }} />
		{:else if $s.state === 'cropping'}
			<ImageCrop url={$s.uri} onSave={onNewImgCropped} />
			<ImageCardBtns {onCancel} onNew={fileSelectStart} />
		{:else if $s.state === 'cropped'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} />
		{:else if $s.state === 'db_saving' || $s.state === 'image_storage_uploading' || $s.state === 'upload_url_fetching'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
			<div out:fade><UploadProgress uploadProgress={$s.uploadProgress} /></div>
		{:else if $s.state === 'completed'}
			<ImageCardOverlays img={{ kind: 'full', url: $s.savedImg?.url, crop: $s.savedImg?.crop }} />
			<ImageCardBtns badgeCheck />
		{/if}
	</div>
{/if}

<ConfirmDelAvatarModal open={deleteConfirmationModalOpen} {handleDelete} />
```
shiki-end -->
	</CodeTopper>
{:else if part === 3}
	<CodeTopper title="AvatarEditor.svelte Part 3">
		<!-- shiki-start
```svelte
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { CropImgUploadController, type CropControllerState } from '$lib/cloudStorage/client';
	import { uploadS3PresignedPost } from '$lib/cloudStorage/client'; // [!diff-add]
	import { FileInput } from '$lib/components';
	import { ImageCrop, UploadProgress, ImageCardBtns, ImageCardOverlays } from '$lib/image/client';
	import type { CropValue } from '$lib/image/client'; // [!diff-add]
	import ConfirmDelAvatarModal from './ConfirmDelAvatarModal.svelte';
	import { updateAvatarCrop } from './avatar/crop.json'; // [!diff-add]
	import { // [!diff-add]
		MAX_UPLOAD_SIZE, // [!diff-add]
		getSignedAvatarUploadUrl, // [!diff-add]
		checkAndSaveUploadedAvatar, // [!diff-add]
		deleteAvatar, // [!diff-add]
	} from './avatar/upload.json'; // [!diff-add]

	export let avatar: DB.User['avatar'];
	export let onCancel: () => void;
	export let updateAvatar: (img: DB.User['avatar']) => void;

	onDestroy(() => editAvatarController.cancel());

	const s = writable<CropControllerState>(
		avatar ? { state: 'cropping_preexisting', crop: avatar.crop, url: avatar.url } : { state: 'file_selecting' },
	);

	const editAvatarController = new CropImgUploadController(s);

	const onPreexistingImgCropped = async (crop: CropValue) => { // [!diff-add]
		const saveCropRes = await editAvatarController.saveCropValToDb({ // [!diff-add]
			saveCropToDb: () => updateAvatarCrop().send({ crop }), // [!diff-add]
			crop, // [!diff-add]
		}); // [!diff-add]
		if (saveCropRes || saveCropRes === null) updateAvatar(saveCropRes); // [!diff-add]
	}; // [!diff-add]

	const fileSelectStart = () => editAvatarController.fileSelectStart(); // [!diff-add]

	const onFileSelected = async (files: File[]) => { // [!diff-add]
		await editAvatarController.loadFiles({ files, MAX_UPLOAD_SIZE }); // [!diff-add]
		editAvatarController.startCrop(); // [!diff-add]
	};

	const onNewImgCropped = async (crop: CropValue) => { // [!diff-add]
		editAvatarController.loadCropValue({ crop }); // [!diff-add]
		const uploadRes = await editAvatarController.uploadCropped({ // [!diff-add]
			getUploadArgs: getSignedAvatarUploadUrl().send, // [!diff-add]
			upload: uploadS3PresignedPost, // [!diff-add]
			saveToDb: ({ crop }) => checkAndSaveUploadedAvatar().send({ crop }), // [!diff-add]
		}); // [!diff-add]
		if (uploadRes || uploadRes === null) updateAvatar(uploadRes); // [!diff-add]
	}; // [!diff-add]

	const deleteConfirmationModalOpen = writable(false); // [!diff-add]
	const openDelConfirmation = () => deleteConfirmationModalOpen.set(true); // [!diff-add]
	const handleDelete = async () => { // [!diff-add]
		const deleteRes = await editAvatarController.deleteImg({ delImg: deleteAvatar().send }); // [!diff-add]
		if (deleteRes || deleteRes === null) updateAvatar(deleteRes); // [!diff-add]
	}; // [!diff-add]
</script>

{#if $s.state === 'file_selecting'}
	<FileInput onSelect={onFileSelected} accept="image/jpeg, image/png" />
{:else}
	<div class="relative aspect-square h-80 w-80 sm:h-[32rem] sm:w-[32rem]">
		{#if $s.state === 'error'}
			<ImageCardOverlays
				img={{ kind: 'overlay', url: $s.img.url, crop: $s.img.crop, blur: true }}
				overlay={{ red: true }}
				{onCancel}
				errorMsgs={$s.errorMsgs}
			/>
		{:else if $s.state === 'cropping_preexisting'}
			<ImageCrop url={$s.url} crop={$s.crop} onSave={onPreexistingImgCropped} />
			<ImageCardBtns {onCancel} onNew={fileSelectStart} onDelete={openDelConfirmation} />
		{:else if $s.state === 'db_updating_preexisting' || $s.state === 'deleting_preexisting'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.url, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
		{:else if $s.state === 'uri_loading'}
			<ImageCardOverlays img={{ kind: 'skeleton' }} />
		{:else if $s.state === 'uri_loaded'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: null }} />
		{:else if $s.state === 'cropping'}
			<ImageCrop url={$s.uri} onSave={onNewImgCropped} />
			<ImageCardBtns {onCancel} onNew={fileSelectStart} />
		{:else if $s.state === 'cropped'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} />
		{:else if $s.state === 'db_saving' || $s.state === 'image_storage_uploading' || $s.state === 'upload_url_fetching'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
			<div out:fade><UploadProgress uploadProgress={$s.uploadProgress} /></div>
		{:else if $s.state === 'completed'}
			<ImageCardOverlays img={{ kind: 'full', url: $s.savedImg?.url, crop: $s.savedImg?.crop }} />
			<ImageCardBtns badgeCheck />
		{/if}
	</div>
{/if}

<ConfirmDelAvatarModal open={deleteConfirmationModalOpen} {handleDelete} />
```
shiki-end -->
	</CodeTopper>
{/if}
