<script lang="ts">
	import { AlertTriangle, ImageIcon, Loader } from '$lib/styles/icons';
	import type { CropValue } from '$lib/image/client';

	interface Props {
		img?:
			| { kind: 'overlay'; url: string | null | undefined; crop: CropValue | null; blur?: true }
			| { kind: 'skeleton' }
			| { kind: 'full'; url: string | undefined; crop: CropValue | undefined; blur?: true }
			| null;
		overlay?: { pulsingWhite?: true; red?: never } | { pulsingWhite?: never; red?: true } | null;
		errorMsgs?: [string, string] | [string, null] | null;
		onCancel?: (() => void) | undefined;
	}

	const { img = null, overlay = null, errorMsgs = null, onCancel = undefined }: Props = $props();

	const wrapperStyles = 'overflow: hidden; height: 100%;';

	const cropStyles = $derived(
		img && 'crop' in img && img.crop
			? `transform: translateX(-50%) translateY(-50%) rotate(${img.crop.rotation}deg);` +
					`height: ${img.crop.scale * 100}%;` +
					`margin-left: ${img.crop.aspect * 50 + img.crop.position.x * 100}%;` +
					`margin-top: ${img.crop.aspect * 50 + img.crop.position.y * 100}%;` +
					'max-width: none;'
			: '',
	);
</script>

{#if img?.kind === 'overlay' && img.url}
	<div style={wrapperStyles} class="relative">
		<div class="absolute inset-0">
			<img style={cropStyles} src={img.url} alt="" class={img.blur ? 'blur-md' : ''} referrerpolicy="no-referrer" />
		</div>
		<div class="absolute inset-0" style="background-color: rgb(11, 11, 11); opacity: 70%;"></div>
		<div class="absolute inset-0 overflow-hidden rounded-full border border-gray-6">
			<img style={cropStyles} src={img.url} alt="" class={img.blur ? 'blur-md' : ''} referrerpolicy="no-referrer" />
		</div>
	</div>
{:else if img?.kind === 'full' && img.url}
	<div style={wrapperStyles}>
		<img style={cropStyles} src={img.url} class={img.blur ? 'blur-md' : ''} alt="" referrerpolicy="no-referrer" />
	</div>
{:else if img?.kind === 'skeleton'}
	<div class="absolute inset-0 animate-pulse bg-gray-3" aria-label="Loading"></div>
	<div class="absolute inset-0 grid place-items-center">
		<div class="flex flex-wrap gap-4">
			<Loader class="h-14 w-14 animate-spin-slow" />
			<ImageIcon class="h-14 w-14" />
		</div>
	</div>
{/if}

{#if overlay?.pulsingWhite}
	<div class="absolute inset-0 animate-pulse bg-white/20"></div>
{:else if overlay?.red}
	<div class="absolute inset-0 bg-red-9/50"></div>
{/if}

{#if errorMsgs}
	<div class="absolute inset-0 grid place-content-center text-center">
		<div class="flex flex-col gap-1 rounded-card bg-gray-2 p-4 text-gray-12">
			<p class="text-2xl font-bold">{errorMsgs[0]}</p>
			<div class="flex justify-center"><AlertTriangle class="h-16 w-16" /></div>
			{#if errorMsgs[1]}
				<p>{errorMsgs[1]}</p>
			{/if}
		</div>
	</div>
{/if}

{#if onCancel}
	<div class="absolute bottom-0 right-0 overflow-hidden rounded-tl-card">
		<button class="btn btn-accent w-full rounded-none rounded-br-card rounded-tl-card" onclick={onCancel}>
			Cancel
		</button>
	</div>
{/if}
