<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { uploadS3PresignedPost, CropImgUploadController, type CropControllerState } from '$lib/cloudStorage/client';
	import { FileInput } from '$lib/components';
	import { ImageCrop, UploadProgress, ImageCardBtns, ImageCardOverlays, type CropValue } from '$lib/image/client';
	import ConfirmDelAvatarModal from './ConfirmDelAvatarModal.svelte';
	import { updateAvatarCrop } from './avatar/crop.json';
	import {
		MAX_UPLOAD_SIZE,
		getSignedAvatarUploadUrl,
		checkAndSaveUploadedAvatar,
		deleteAvatar,
	} from './avatar/upload.json';

	interface Props {
		avatar: DB.User['avatar'];
		onCancel: () => void;
		updateAvatar: (img: DB.User['avatar']) => void | Promise<void>;
	}

	const { avatar, onCancel, updateAvatar }: Props = $props();

	onDestroy(() => editAvatarController.cancel());

	const s = writable<CropControllerState>(
		avatar ? { state: 'cropping_preexisting', crop: avatar.crop, url: avatar.url } : { state: 'file_selecting' },
	);

	const editAvatarController = new CropImgUploadController(s);

	const onPreexistingImgCropped = async (crop: CropValue) => {
		const saveCropRes = await editAvatarController.saveCropValToDb({
			saveCropToDb: () => updateAvatarCrop().send({ crop }),
			crop,
		});
		if (saveCropRes || saveCropRes === null) await updateAvatar(saveCropRes);
	};

	const fileSelectStart = () => editAvatarController.fileSelectStart();

	const onFileSelected = async (files: File[]) => {
		await editAvatarController.loadFiles({ files, MAX_UPLOAD_SIZE });
		editAvatarController.startCrop();
	};

	const onNewImgCropped = async (crop: CropValue) => {
		editAvatarController.loadCropValue({ crop });
		const uploadRes = await editAvatarController.uploadCropped({
			getUploadArgs: getSignedAvatarUploadUrl().send,
			upload: uploadS3PresignedPost,
			saveToDb: ({ crop }) => checkAndSaveUploadedAvatar().send({ crop }),
		});
		if (uploadRes || uploadRes === null) await updateAvatar(uploadRes);
	};

	const deleteConfirmationModalOpen = writable(false);
	const openDelConfirmation = () => deleteConfirmationModalOpen.set(true);
	const handleDelete = async () => {
		const deleteRes = await editAvatarController.deleteImg({ delImg: deleteAvatar().send });
		if (deleteRes || deleteRes === null) await updateAvatar(deleteRes);
	};
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
		{:else if $s.state === 'db_updating_preexisting'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.url, crop: $s.crop }} />
			<ImageCardBtns loader />
		{:else if $s.state === 'deleting_preexisting'}
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
		{:else if $s.state === 'upload_url_fetching' || $s.state === 'image_storage_uploading' || $s.state === 'db_saving'}
			<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
			<div out:fade><UploadProgress uploadProgress={$s.uploadProgress} /></div>
		{:else if $s.state === 'completed'}
			<ImageCardOverlays img={{ kind: 'full', url: $s.savedImg?.url, crop: $s.savedImg?.crop }} />
			<ImageCardBtns badgeCheck />
		{:else if $s.state === 'canceled'}
			<!--  -->
		{/if}
	</div>
{/if}

<ConfirmDelAvatarModal open={deleteConfirmationModalOpen} {handleDelete} />
