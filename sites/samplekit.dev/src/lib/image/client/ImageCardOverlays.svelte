<script lang="ts">
	import { AlertTriangle, ImageIcon, Loader } from '$lib/styles/icons';
	import type { CropValue } from '$lib/image/client';

	export let img:
		| { kind: 'overlay'; url: string | null | undefined; crop: CropValue | null; blur?: true }
		| { kind: 'skeleton' }
		| { kind: 'full'; url: string | undefined; crop: CropValue | undefined; blur?: true }
		| null = null;

	export let overlay: { pulsingWhite?: true; red?: never } | { pulsingWhite?: never; red?: true } | null = null;

	export let errorMsgs: [string, string] | [string, null] | null = null;

	export let onCancel: (() => void) | undefined = undefined;

	const wrapperStyles = 'overflow: hidden; height: 100%;';

	$: cropStyles =
		img && 'crop' in img && img.crop
			? `transform: translateX(-50%) translateY(-50%) rotate(${img.crop.rotation}deg);` +
				`height: ${img.crop.scale * 100}%;` +
				`margin-left: ${img.crop.aspect * 50 + img.crop.position.x * 100}%;` +
				`margin-top: ${img.crop.aspect * 50 + img.crop.position.y * 100}%;` +
				'max-width: none;'
			: '';
</script>

{#if img?.kind === 'overlay' && img.url}
	<div style={wrapperStyles} class="relative">
		<div class="absolute inset-0">
			<img style={cropStyles} src={img.url} alt="" class={img.blur ? 'blur-md' : ''} referrerpolicy="no-referrer" />
		</div>
		<div class="absolute inset-0" style="background-color: rgb(11, 11, 11); opacity: 70%;" />
		<div class="border-gray-6 absolute inset-0 overflow-hidden rounded-full border">
			<img style={cropStyles} src={img.url} alt="" class={img.blur ? 'blur-md' : ''} referrerpolicy="no-referrer" />
		</div>
	</div>
{:else if img?.kind === 'full' && img.url}
	<div style={wrapperStyles}>
		<img style={cropStyles} src={img.url} class={img.blur ? 'blur-md' : ''} alt="" referrerpolicy="no-referrer" />
	</div>
{:else if img?.kind === 'skeleton'}
	<div class="bg-gray-3 absolute inset-0 animate-pulse" aria-label="Loading" />
	<div class="absolute inset-0 grid place-items-center">
		<div class="flex flex-wrap gap-4">
			<Loader class="animate-spin-slow h-14 w-14" />
			<ImageIcon class="h-14 w-14" />
		</div>
	</div>
{/if}

{#if overlay?.pulsingWhite}
	<div class="absolute inset-0 animate-pulse bg-white/20" />
{:else if overlay?.red}
	<div class="bg-red-9/50 absolute inset-0" />
{/if}

{#if errorMsgs}
	<div class="absolute inset-0 grid place-content-center text-center">
		<div class="bg-gray-2 rounded-card text-gray-12 flex flex-col gap-1 p-4">
			<p class="text-2xl font-bold">{errorMsgs[0]}</p>
			<div class="flex justify-center"><AlertTriangle class="h-16 w-16" /></div>
			{#if errorMsgs[1]}
				<p>{errorMsgs[1]}</p>
			{/if}
		</div>
	</div>
{/if}

{#if onCancel}
	<div class="rounded-tl-card absolute bottom-0 right-0 overflow-hidden">
		<button class="btn btn-accent rounded-tl-card rounded-br-card w-full rounded-none" on:click={onCancel}>
			Cancel
		</button>
	</div>
{/if}
