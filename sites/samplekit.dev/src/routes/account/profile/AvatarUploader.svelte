<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import { uploadToCloudStorage, ImageUpload } from '$lib/cloudStorage/client';
	import { FileInput } from '$lib/components';
	import { ImageCrop, fileToDataUrl, humanReadableFileSize } from '$lib/image/client';
	import { assertUnreachable } from '$lib/utils/common';
	import { checkAndSaveUploadedAvatar } from '$routes/account/profile/avatar/upload.json';
	import { MAX_UPLOAD_SIZE, getS3UploadUrl } from '$routes/s3/upload-url.json';
	import type { CroppedImg } from '$lib/db/client';
	import type { CropValue } from 'svelte-crop-window';

	// state 1
	// FileInput (Await User): click or drag to select file
	// AvatarUploader (Automatic): validates file is smaller than max size, set file and generate inMemoryFileURI
	let file: File | null = null;
	let inMemoryFileURI: string | null = null;

	// state 2
	// ImageCrop (Await User): user crops or chooses a new picture (back to state 1)
	let cropValue: CropValue | null = null;

	// state 3
	let uploadError: [string, string] | [string, null] | null = null;
	// ImageUpload (Automatic): get the s3 bucket url from our server
	// ImageUpload (Automatic): upload file to s3 with progress bar
	// ImageUpload (Automatic): server validates image is on cloudfront and that there is no explicit content, deletes/invalidates old avatar and saves new one to db, and adds metadata to object
	// AvatarUploader (Automatic): once ImageUpload finishes, reset component and call parent onNewImg cb

	const reset = () => {
		file = null;
		inMemoryFileURI = null;
		cropValue = null;
		uploadError = null;
	};

	export const cancel = () => {
		triggerUploadCancel();
		reset();
	};

	export let onNewImg: (newImg: CroppedImg | null) => void;

	let triggerUploadCancel = () => {};
</script>

{#if uploadError}
	<div class="relative h-80 w-80 sm:h-[512px] sm:w-[512px]">
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
			style={`${inMemoryFileURI ? `background-image: url(${inMemoryFileURI});` : ''}`}
		/>
		<div class="bg-red-9 absolute inset-0 opacity-50"></div>

		<div class="absolute inset-0 grid place-content-center text-center">
			<div class="bg-gray-2 rounded-card text-gray-12 flex flex-col gap-1 p-4">
				<p class="text-2xl font-bold">{uploadError[0]}</p>
				<div class="flex justify-center"><AlertTriangle class="h-16 w-16" /></div>
				{#if uploadError[1]}
					<p>{uploadError[1]}</p>
				{/if}
			</div>
		</div>

		<div class="rounded-tl-card absolute bottom-0 right-0 overflow-hidden">
			<button class="btn btn-accent w-full rounded-none" on:click={cancel}>Cancel</button>
		</div>
	</div>
{:else if !file || !inMemoryFileURI}
	<FileInput
		onSelect={async (files) => {
			if (!files[0]) return;
			file = files[0];

			if (file.size > MAX_UPLOAD_SIZE) {
				uploadError = [
					`File size (${humanReadableFileSize(file.size)}) must be less than ${humanReadableFileSize(MAX_UPLOAD_SIZE)}`,
					null,
				];
				file = null;
				return;
			}
			const { uri } = await fileToDataUrl(file);
			if (uri) {
				inMemoryFileURI = uri;
			} else {
				console.error('Error reading file');
				file = null;
				inMemoryFileURI = null;
			}
		}}
	/>
{:else if !cropValue}
	<ImageCrop
		url={inMemoryFileURI}
		disabled={!!cropValue}
		onCancel={cancel}
		onNew={() => {
			inMemoryFileURI = null;
			file = null;
		}}
		onSave={(crop) => (cropValue = crop)}
	/>
{:else}
	<ImageUpload
		getUploadUrl={async () => getS3UploadUrl().send()}
		upload={({ file, uploadUrl, uploadProgress }) =>
			uploadToCloudStorage({ method: 'PUT', data: file, uploadUrl, uploadProgress })}
		saveToDb={async ({ crop, objectUrl }) => checkAndSaveUploadedAvatar().send({ crop, s3ObjectUrl: objectUrl })}
		{file}
		{inMemoryFileURI}
		{cropValue}
		useCropWindow
		bind:cancel={triggerUploadCancel}
		onError={(error) => {
			const state = error.state;

			switch (state) {
				case 'db_saving': {
					if (error.status === 422) {
						return (uploadError = [error.message, 'If this is a mistake, please contact support.']);
					} else {
						return (uploadError = [error.message, 'Please try again.']);
					}
				}

				case 'upload_url_fetching':
				case 'image_storage_uploading':
					return (uploadError = ['Upload failed', 'Please try again.']);
			}

			assertUnreachable(state);
		}}
		onNewImg={(img) => {
			reset();
			onNewImg(img);
		}}
	/>
{/if}
