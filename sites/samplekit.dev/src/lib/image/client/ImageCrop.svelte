<script lang="ts">
	import { ImagePlus, Trash2, XCircle } from 'lucide-svelte';
	import { CropWindow, defaultValue, defaultOptions, type CropValue } from '$lib/image/client';

	export let url: string;
	export let disabled = false;
	export let onSave: (value: CropValue) => void;
	export let onNew: (() => void) | undefined = undefined;
	export let onCancel: (() => void) | undefined = undefined;
	export let onDelete: (() => void) | undefined = undefined;
	export let crop: CropValue | undefined = undefined;
	let value = { ...(crop || defaultValue) };
</script>

<div class="relative h-80 w-80 sm:h-[512px] sm:w-[512px]">
	<CropWindow
		bind:value
		media={{ content_type: 'image', url }}
		options={{ ...defaultOptions, shape: 'round', crop_window_margin: 0 }}
	/>

	<div class="rounded-tr-card absolute left-0 top-0">
		{#if onCancel}
			<button {disabled} class="ml-3 mt-3 text-white" on:click|stopPropagation={onCancel} aria-label="Cancel">
				<XCircle />
			</button>
		{/if}
		{#if onNew}
			<button {disabled} class="ml-3 mt-3 text-white" on:click|stopPropagation={onNew} aria-label="New">
				<ImagePlus />
			</button>
		{/if}
	</div>

	{#if onDelete}
		<div class="rounded-tr-card absolute right-0 top-0">
			<button {disabled} class="mr-3 mt-3 text-white" on:click|stopPropagation={onDelete} aria-label="Delete">
				<Trash2 />
			</button>
		</div>
	{/if}

	<div class="absolute bottom-0 right-0">
		<button
			{disabled}
			class="btn btn-accent rounded-tl-card rounded-br-card w-full rounded-none"
			on:click|stopPropagation={() => onSave(value)}
		>
			Save
		</button>
	</div>
</div>
