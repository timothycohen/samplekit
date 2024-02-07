<script lang="ts" generics="SvelteGeneric extends Record<string, unknown>">
	/* Responsibilities:
	 * - handleUpload immediately onMount (get upload url, upload to image storage, save to db)
	 * - if canceled during upload, abort it
	 * - UI: indicators: progress; overlays: pending / error;
	 */

	import { onMount } from 'svelte';
	import { circOut } from 'svelte/easing';
	import { tweened, type Tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { CropWindow, type CropValue, defaultOptions } from '$lib/image/client';
	import { assertUnreachable, type Result } from '$lib/utils/common';
	import type { CroppedImg, ImgCrop } from '$lib/db/client';
	import type { UploaderRes } from '.';

	export let file: File;
	export let inMemoryFileURI: string;
	export let cropValue: CropValue;
	export let useCropWindow = false;

	export let getUploadUrl: () => Promise<Result<SvelteGeneric & { uploadUrl: string }>>;

	export let upload: (
		a: SvelteGeneric & { uploadUrl: string } & {
			file: File;
			uploadProgress?: { scale?: number | undefined; tweened?: Tweened<number> | undefined } | undefined;
		},
	) => UploaderRes;

	export let saveToDb: (a: { crop: ImgCrop }) => Promise<Result<{ savedImg: CroppedImg | null }>>;

	export let onNewImg: (newImg: CroppedImg | null) => void;
	export let onError: (
		e: { state: 'upload_url_fetching' | 'image_storage_uploading' | 'db_saving' } & App.JSONError,
	) => void;

	export const cancel = () => {
		switch (state) {
			case 'idle':
			case 'get_upload_url':
			case 'complete':
			case 'error':
				return;
			case 'save_to_db':
				console.error('Already saved to image storage. Uploading to db. Ignoring cancel.');
				return;
			case 'upload':
				abort();
				return;
			default:
				assertUnreachable(state);
		}
	};

	const handleError = (a: {
		state: 'upload_url_fetching' | 'image_storage_uploading' | 'db_saving';
		error: App.JSONError;
	}) => {
		uploadProgress.set(0);
		state = 'error';
		onError({ state: a.state, ...a.error });
	};

	let state: 'idle' | 'get_upload_url' | 'upload' | 'save_to_db' | 'complete' | 'error' = 'idle';
	let abort = () => {};
	const uploadProgress = tweened(0, { easing: circOut });

	const handleUpload = async () => {
		// get the upload url from our server (progress 3%-10%)
		state = 'get_upload_url';
		uploadProgress.set(3);
		const { data: getUrlData, error: getUrlError } = await getUploadUrl();
		if (getUrlError) return handleError({ state: 'upload_url_fetching', error: getUrlError });
		uploadProgress.set(10);

		// upload file to image storage (progress 10%-90%)
		state = 'upload';
		const uploading = upload({ file, ...getUrlData, uploadProgress: { tweened: uploadProgress, scale: 0.9 } });
		abort = uploading.abort;
		const { error: uploadError } = await uploading.promise;
		abort = () => {};
		if (uploadError) return handleError({ state: 'image_storage_uploading', error: uploadError });

		// save url and crop values to db (progress 90%-100%)
		state = 'save_to_db';
		for (let i = 0; i < 10; i++) {
			setTimeout(() => state === 'save_to_db' && uploadProgress.update((v) => Math.min(v + 1, 100)), 20 * i);
		}
		const { data: savedImgData, error: dbSaveError } = await saveToDb({ crop: cropValue });
		uploadProgress.set(100);
		if (dbSaveError) return handleError({ state: 'db_saving', error: dbSaveError });

		// finish
		state = 'complete';
		onNewImg(savedImgData.savedImg);
		uploadProgress.set(0);
	};

	onMount(async () => {
		handleUpload();
	});
</script>

{#if useCropWindow}
	<div class="relative h-80 w-80 bg-cover bg-center bg-no-repeat sm:h-[512px] sm:w-[512px]">
		<CropWindow
			value={cropValue}
			media={{ content_type: 'image', url: inMemoryFileURI }}
			options={{ ...defaultOptions, shape: 'round', crop_window_margin: 0 }}
		/>
		<div class="bg-cover bg-center bg-no-repeat" style={`background-image: url('${inMemoryFileURI}')`} />

		{#if state === 'upload' || state === 'save_to_db'}
			<div class="absolute inset-0 animate-pulse bg-white/40" out:fade|local></div>
		{/if}
		<div class="bg-accent-9 absolute bottom-0 h-5" style="width: {$uploadProgress}%" />
	</div>
{:else}
	<div
		class="relative h-80 w-80 bg-cover bg-center bg-no-repeat sm:h-[512px] sm:w-[512px]"
		style={`background-image: url('${inMemoryFileURI}')`}
	>
		{#if state === 'save_to_db'}
			<div class="absolute inset-0 animate-pulse bg-white/40" out:fade|local></div>
		{/if}
		<div class="bg-accent-9 absolute bottom-0 h-5" style="width: {$uploadProgress}%" />
	</div>
{/if}
