<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { Avatar } from '$lib/components';
	import { UploadProgress, ImageCardBtns, ImageCardOverlays } from '$lib/image/client';
	import { CropWindow, defaultOptions } from '$lib/image/client';
	import owl from './owl-400w.webp';
	import smoky from './smoky-400w.webp';
	import type { CropControllerState } from '$lib/cloudStorage/client';

	let avatar: DB.User['avatar'] = null;

	const rotation = tweened(0, { duration: 500, easing: cubicOut });
	const scale = tweened(1, { duration: 500, easing: cubicOut });
	const uploadProgress = tweened(0, { duration: 1000, easing: cubicOut });
	const crop = { position: { x: 0, y: 0 }, aspect: 1, rotation: 165, scale: 1.5 };
	const noop = () => {};
	const s = writable<CropControllerState>({ state: 'canceled' });
	const timeouts: Array<ReturnType<typeof setTimeout>> = [];

	const reset = () => {
		s.set({ state: 'canceled' });
		timeouts.forEach(clearTimeout);
		rotation.set(0, { duration: 0 });
		scale.set(1, { duration: 0 });
		uploadProgress.set(0, { duration: 0 });
	};

	const cancel = () => {
		reset();
		editAvatarOpen.set(false);
	};

	const {
		elements: { portalled, overlay, content },
		states: { open: editAvatarOpen },
	} = createDialog({
		forceVisible: true,
		onOpenChange: ({ next }) => {
			if (next === false) reset();
			return next;
		},
	});

	const happyPath = () => {
		reset();
		avatar = null;
		s.set({
			state: 'cropped',
			uri: owl,
			crop: { position: { x: 0, y: 0 }, aspect: 1, rotation: $rotation, scale: $scale },
			// @ts-expect-error – this is a mock
			file: null,
		});

		timeouts.push(setTimeout(() => editAvatarOpen.set(true), 300));

		timeouts.push(setTimeout(() => rotation.set(crop.rotation), 600));

		timeouts.push(setTimeout(() => scale.set(crop.scale), 900));

		timeouts.push(
			setTimeout(() => {
				s.set({
					state: 'image_storage_uploading',
					crop,
					uri: owl,
					abortUpload: noop,
					imageUploadPromise: new Promise(noop),
					uploadProgress,
				});
				uploadProgress.set(100);
			}, 1500),
		);

		timeouts.push(
			setTimeout(() => {
				avatar = { crop, url: owl };
				s.set({ state: 'completed', savedImg: avatar });
			}, 3000),
		);

		timeouts.push(setTimeout(() => editAvatarOpen.set(false), 4000));
	};

	const moderationErrPath = () => {
		reset();
		avatar = null;
		s.set({
			state: 'cropped',
			uri: smoky,
			crop: { position: { x: 0, y: 0 }, aspect: 1, rotation: 0, scale: 1 },
			// @ts-expect-error – this is a mock
			file: null,
		});

		timeouts.push(setTimeout(() => editAvatarOpen.set(true), 300));

		timeouts.push(
			setTimeout(() => {
				s.set({
					state: 'image_storage_uploading',
					crop: { position: { x: 0, y: 0 }, aspect: 1, rotation: 0, scale: 1 },
					uri: smoky,
					abortUpload: noop,
					imageUploadPromise: new Promise(noop),
					uploadProgress,
				});
				uploadProgress.set(100);
			}, 500),
		);

		timeouts.push(
			setTimeout(() => {
				s.set({
					state: 'error',
					errorMsgs: ['Image may contain inappropriate content: Smoking.', null],
					img: { url: smoky, crop: { position: { x: 0, y: 0 }, aspect: 1, rotation: 0, scale: 1 } },
				});
			}, 2000),
		);
	};
</script>

<div class="mx-auto">
	<Avatar {avatar} size={300} />
</div>

<p class="my-4 text-center text-lg">
	<a class="link" href="/login">Sign in</a> to use the demo or view
	<button class="btn btn-accent inline-block px-2 py-1" on:click={() => happyPath()}> Happy Path Mock </button>
	<button class="btn btn-accent inline-block px-2 py-1" on:click={() => moderationErrPath()}>
		Moderation Error Mock
	</button>
</p>

<div use:melt={$portalled}>
	{#if $editAvatarOpen}
		<div use:melt={$overlay} class="modal-overlay" />
		<div class="modal-content-position rounded-card overflow-hidden" use:melt={$content}>
			<div class="relative aspect-square h-80 w-80 sm:h-[32rem] sm:w-[32rem]">
				{#if $s.state === 'error'}
					<ImageCardOverlays
						img={{ kind: 'overlay', url: $s.img.url, crop: $s.img.crop, blur: true }}
						overlay={{ red: true }}
						onCancel={cancel}
						errorMsgs={$s.errorMsgs}
					/>
				{:else if $s.state === 'cropped'}
					<div class="crop-wrapper contents">
						<CropWindow
							value={{ position: { x: 0, y: 0 }, aspect: 1, rotation: $rotation, scale: $scale }}
							media={{ content_type: 'image', url: $s.uri }}
							options={{ ...defaultOptions, shape: 'round', crop_window_margin: 0 }}
						/>
					</div>
					<div class="absolute bottom-0 right-0">
						<button class="btn btn-accent rounded-tl-card rounded-br-card w-full rounded-none"> Save </button>
					</div>
					<ImageCardBtns onCancel={cancel} onNew={noop} />
				{:else if $s.state === 'image_storage_uploading'}
					<ImageCardOverlays img={{ kind: 'overlay', url: $s.uri, crop: $s.crop }} overlay={{ pulsingWhite: true }} />
					<ImageCardBtns loader />
					<div out:fade><UploadProgress uploadProgress={$s.uploadProgress} /></div>
				{:else if $s.state === 'completed'}
					<ImageCardOverlays img={{ kind: 'full', url: $s.savedImg?.url, crop: $s.savedImg?.crop }} />
					<ImageCardBtns badgeCheck />
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.crop-wrapper :global(.outline) {
		@apply border-gray-6 outline-none;
	}
</style>
