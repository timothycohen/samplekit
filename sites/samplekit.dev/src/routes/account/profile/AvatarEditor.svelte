<script lang="ts">
	import { fade } from 'svelte/transition';
	import { uploadS3PresignedPost, CropImgUploadController } from '$lib/cloudStorage/client';
	import { FileInput } from '$lib/components';
	import { ImageCrop, UploadProgress, ImageCardBtns, ImageCardOverlays } from '$lib/image/client';
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
		onNewAvatar: (img: DB.User['avatar']) => void | Promise<void>;
		onCancel: () => void;
	}

	const { avatar, onCancel, onNewAvatar }: Props = $props();

	const controller = new CropImgUploadController({
		saveCropToDb: updateAvatarCrop.send,
		delImg: deleteAvatar.send,
		getUploadArgs: getSignedAvatarUploadUrl.send,
		upload: uploadS3PresignedPost,
		saveToDb: checkAndSaveUploadedAvatar.send,
	});

	if (avatar) controller.toCropPreexisting(avatar);
	else controller.toFileSelect();

	const s = $derived(controller.value);

	let deleteConfirmationModalOpen = $state(false);
</script>

{#if s.state === 'file_selecting'}
	<FileInput
		onSelect={async (files: File[]) => {
			const erroredCanceledOrLoaded = await s.loadFiles({ files, MAX_UPLOAD_SIZE });
			if (erroredCanceledOrLoaded.state === 'uri_loaded') erroredCanceledOrLoaded.startCrop();
		}}
		accept="image/jpeg, image/png"
	/>
{:else}
	<div class="relative aspect-square h-80 w-80 sm:h-[32rem] sm:w-[32rem]">
		{#if s.state === 'error'}
			<ImageCardOverlays
				img={{ kind: 'overlay', url: s.img.url, crop: s.img.crop, blur: true }}
				overlay={{ red: true }}
				{onCancel}
				errorMsgs={s.errorMsgs}
			/>
		{:else if s.state === 'cropping_preexisting'}
			<ImageCrop
				url={s.url}
				crop={s.crop}
				onSave={async (crop) => {
					const erroredCanceledOrCompleted = await s.saveCropValToDb({ crop });
					if (erroredCanceledOrCompleted.state === 'completed') await onNewAvatar(erroredCanceledOrCompleted.savedImg);
				}}
			/>
			<ImageCardBtns {onCancel} onNew={controller.toFileSelect} onDelete={() => (deleteConfirmationModalOpen = true)} />
			<ConfirmDelAvatarModal
				bind:open={deleteConfirmationModalOpen}
				handleDelete={async () => {
					const erroredCanceledOrCompleted = await s.deleteImg();
					if (erroredCanceledOrCompleted.state === 'completed') await onNewAvatar(erroredCanceledOrCompleted.savedImg);
				}}
			/>
		{:else if s.state === 'db_updating_preexisting'}
			<ImageCardOverlays img={{ kind: 'overlay', url: s.url, crop: s.crop }} />
			<ImageCardBtns loader />
		{:else if s.state === 'deleting_preexisting'}
			<ImageCardOverlays img={{ kind: 'overlay', url: s.url, crop: s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
		{:else if s.state === 'uri_loading'}
			<ImageCardOverlays img={{ kind: 'skeleton' }} />
		{:else if s.state === 'uri_loaded'}
			<ImageCardOverlays img={{ kind: 'overlay', url: s.uri, crop: null }} />
		{:else if s.state === 'cropping'}
			<ImageCrop
				url={s.uri}
				onSave={async (crop) => {
					const erroredCanceledOrCompleted = await s.loadCropValue({ crop }).uploadCropped();
					if (erroredCanceledOrCompleted.state === 'completed') await onNewAvatar(erroredCanceledOrCompleted.savedImg);
				}}
			/>
			<ImageCardBtns {onCancel} onNew={controller.toFileSelect} />
		{:else if s.state === 'cropped'}
			<ImageCardOverlays img={{ kind: 'overlay', url: s.uri, crop: s.crop }} />
		{:else if s.state === 'upload_url_fetching' || s.state === 'image_storage_uploading' || s.state === 'db_saving'}
			<ImageCardOverlays img={{ kind: 'overlay', url: s.uri, crop: s.crop }} overlay={{ pulsingWhite: true }} />
			<ImageCardBtns loader />
			<div out:fade><UploadProgress uploadProgress={s.uploadProgress} /></div>
		{:else if s.state === 'completed'}
			<ImageCardOverlays img={{ kind: 'full', url: s.savedImg?.url, crop: s.savedImg?.crop }} />
			<ImageCardBtns badgeCheck />
		{:else if s.state === 'idle'}
			<!--  -->
		{/if}
	</div>
{/if}
