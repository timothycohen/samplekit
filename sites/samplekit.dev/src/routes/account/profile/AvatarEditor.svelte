<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { uploadS3PresignedPost, type CropControllerState, CropImgUploadController } from '$lib/cloudStorage/client';
	import { FileInput } from '$lib/components';
	import { ImageCrop, type CropValue } from '$lib/image/client';
	import { CropWindow, defaultOptions, UploadProgress } from '$lib/image/client';
	import ConfirmDelAvatarModal from './ConfirmDelAvatarModal.svelte';
	import { updateAvatarCrop } from './avatar/crop.json';
	import { getSignedAvatarUploadUrl, checkAndSaveUploadedAvatar, deleteAvatar } from './avatar/upload.json';
	import { MAX_UPLOAD_SIZE } from './avatar/upload.json';

	export let avatar: DB.User['avatar'];
	export let onCancel: () => void;
	export let updateAvatar: (img: DB.User['avatar']) => void;

	onDestroy(() => editAvatarController.cancel());

	const open = writable(false);
	const openDelConfirmation = () => open.set(true);

	const s = writable<CropControllerState>(
		avatar ? { state: 'cropping_preexisting', crop: avatar.crop, url: avatar.url } : { state: 'file_selecting' },
	);
	const editAvatarController = new CropImgUploadController(s);

	const fileSelectStart = () => editAvatarController.fileSelectStart();

	const onFileSelect = async (files: File[]) => {
		await editAvatarController.loadFiles({ files, MAX_UPLOAD_SIZE });
		editAvatarController.startCrop();
	};

	const upload = async () => {
		return await editAvatarController.uploadCropped({
			getUploadArgs: getSignedAvatarUploadUrl().send,
			upload: uploadS3PresignedPost,
			saveToDb: ({ crop }) => checkAndSaveUploadedAvatar().send({ crop }),
		});
	};

	const onNewImgCropped = async (crop: CropValue) => {
		editAvatarController.loadCropValue({ crop });
		const res = await upload();
		if (res || res === null) updateAvatar(res);
	};

	const onPreexistingImgCropped = async (crop: CropValue) => {
		const res = await editAvatarController.saveCropValToDb({
			saveCropToDb: () => updateAvatarCrop().send({ crop }),
			crop,
		});
		if (res || res === null) updateAvatar(res);
	};

	const handleDelete = async () => {
		const res = await editAvatarController.deleteImg({ delImg: deleteAvatar().send });
		if (res || res === null) updateAvatar(res);
	};
</script>

{#if $s.state === 'error'}
	<div class="relative h-80 w-80 sm:h-[512px] sm:w-[512px]">
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
			style={`${$s.uri ? `background-image: url(${$s.uri});` : ''}`}
		/>
		<div class="bg-red-9 absolute inset-0 opacity-50"></div>

		<div class="absolute inset-0 grid place-content-center text-center">
			<div class="bg-gray-2 rounded-card text-gray-12 flex flex-col gap-1 p-4">
				<p class="text-2xl font-bold">{$s.errorMsgs[0]}</p>
				<div class="flex justify-center"><AlertTriangle class="h-16 w-16" /></div>
				{#if $s.errorMsgs[1]}
					<p>{$s.errorMsgs[1]}</p>
				{/if}
			</div>
		</div>

		<div class="rounded-tl-card absolute bottom-0 right-0 overflow-hidden">
			<button class="btn btn-accent w-full rounded-none" on:click={onCancel}>Cancel</button>
		</div>
	</div>
{:else if $s.state === 'file_selecting'}
	<FileInput onSelect={onFileSelect} />
{:else if $s.state === 'cropping_preexisting'}
	<ImageCrop
		url={$s.url}
		crop={$s.crop}
		{onCancel}
		onNew={fileSelectStart}
		onSave={onPreexistingImgCropped}
		onDelete={openDelConfirmation}
	/>
{:else if $s.state === 'cropping'}
	<ImageCrop url={$s.uri} {onCancel} onNew={fileSelectStart} onSave={onNewImgCropped} />
{:else if 'uri' in $s && 'crop' in $s}
	<div class="relative h-80 w-80 bg-cover bg-center bg-no-repeat sm:h-[512px] sm:w-[512px]">
		<CropWindow
			value={$s.crop}
			media={{ content_type: 'image', url: $s.uri }}
			options={{ ...defaultOptions, shape: 'round', crop_window_margin: 0 }}
		/>
		<div class="bg-cover bg-center bg-no-repeat" style={`background-image: url('${$s.uri}')`} />

		{#if $s.state === 'db_saving' || $s.state === 'image_storage_uploading' || $s.state === 'upload_url_fetching'}
			<div class="absolute inset-0 animate-pulse bg-white/40" out:fade|local></div>
		{/if}
		{#if 'uploadProgress' in $s}
			<UploadProgress uploadProgress={$s.uploadProgress} />
		{/if}
	</div>
{/if}

<ConfirmDelAvatarModal {open} {handleDelete} />
